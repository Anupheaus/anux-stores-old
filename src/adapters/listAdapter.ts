import { IRecord, PromiseMaybe, Upsertable, bind, DeepPartial } from 'anux-common';
import { Store } from '../stores';

export type ListAdapterProviderChangedDelegate = () => PromiseMaybe;

export interface IStoreListItemState {
  isDirty: boolean;
}

export interface IStoreListItem<TItem extends IRecord, TItemState extends IStoreListItemState> {
  id: string;
  data: TItem;
  state: TItemState;
}

interface IUpsertableStoreListItem<TItem extends IRecord, TItemState extends IStoreListItemState> {
  data: Upsertable<TItem>;
  state?: DeepPartial<TItemState>;
}

export interface ISourceStore<TItem extends IRecord> {
  store: Store;
  get(): TItem[];
  set(item: Upsertable<TItem>): Promise<TItem>;
  hydrate(item: Upsertable<TItem>): TItem;
  removeById(id: string): Promise<void>;
}

interface IStoreListOptions {
  allowDirtyItemsToBeAddedToStore?: boolean;
}

interface IState<TItem extends IRecord, TItemState extends IStoreListItemState> {
  items: IStoreListItem<TItem, TItemState>[];
  sourceItemIds: string[];
}

interface IPendingState<TItemState> {
  id: string;
  state: TItemState;
}

export abstract class StoreListAdapter<TItem extends IRecord, TItemState extends IStoreListItemState,
  TState extends IState<TItem, TItemState> = IState<TItem, TItemState>> extends Store<TState> {
  constructor(source: ISourceStore<TItem>, options?: IStoreListOptions) {
    super();
    this._options = {
      allowDirtyItemsToBeAddedToStore: false,
      ...options,
    };
    this._source = source;
    this._pendingStates = [];
    this.subscribeToSource();
  }

  //#region Variables

  private _options: IStoreListOptions;
  private _source: ISourceStore<TItem>;
  private _pendingStates: IPendingState<TItemState>[];

  //#endregion

  //#region Methods

  @bind
  public async upsert(item: IUpsertableStoreListItem<TItem, TItemState>): Promise<IStoreListItem<TItem, TItemState>> {
    let { items, sourceItemIds } = this.state;
    const { data: upsertableData, state: partialState } = item;
    const id = item.data.id;
    const existingItem = items.findById(id);
    const isInSourceStore = sourceItemIds.includes(id);
    const hasUpdateForState = !!partialState;
    let { data, state } = existingItem || {} as IStoreListItem<TItem, TItemState>;

    state = Object.merge({}, state, partialState);

    let updateLocalStore = true;
    if (isInSourceStore || !state.isDirty || this._options.allowDirtyItemsToBeAddedToStore) {
      const pendingState: IPendingState<TItemState> = { id, state };
      if (hasUpdateForState) { this._pendingStates.push(pendingState); }
      data = await this._source.set(upsertableData);
      updateLocalStore = hasUpdateForState && this._pendingStates.includes(pendingState); // false if the source store updated and set the state
    }
    if (updateLocalStore) {
      if (!isInSourceStore) { data = data ? Object.merge<TItem>({}, data, upsertableData) : this._source.hydrate(upsertableData); }
      items = items.upsert({ id, data, state });
      await this.setState({ items });
    }
    return this.state.items.findById(id);
  }

  @bind
  public async remove(item: IStoreListItem<TItem, TItemState>): Promise<void> {
    return this.removeById(item.data.id);
  }

  @bind
  public async removeById(id: string): Promise<void> {
    await this._source.removeById(id);
  }

  protected abstract createStateForItem(item: TItem, isInSource: boolean): TItemState;

  protected initialiseState(): TState {
    return {
      items: [],
      sourceItemIds: [],
    } as TState;
  }

  private subscribeToSource(): void {
    this.recordSubscriptionTo(this._source.store.onChanged(async () => {
      let { items, sourceItemIds } = this.state;
      const sourceItems = this._source.get();
      const newSourceItemIds = sourceItems.ids();
      const removedItemIds = sourceItemIds.except(newSourceItemIds);

      sourceItemIds = newSourceItemIds;
      items = items.mergeWith(sourceItems, {
        matchBy: (listItem, storeItem) => listItem.data.id === storeItem.id,
        createBy: data => this.createListItemFromData(data, true),
        updateMatched: (item, data) => this.updateMatchedItemFromData(item, data),
        removeUnmatched: item => removedItemIds.includes(item.data.id),
      });

      await this.setState({ items, sourceItemIds });
    }));
  }

  private createListItemFromData(data: TItem, isInSource: boolean, state?: TItemState): IStoreListItem<TItem, TItemState> {
    state = state || this.getAnyPendingStateFor(data, isInSource) || this.createStateForItem(data, isInSource);
    return {
      id: data.id,
      data,
      state,
    };
  }

  private updateMatchedItemFromData(item: IStoreListItem<TItem, TItemState>, data: TItem): IStoreListItem<TItem, TItemState> {
    const state = this.getAnyPendingStateFor(data, true);
    const hasDataChanged = !Reflect.areShallowEqual(item.data, data);
    if (!state && !hasDataChanged) { return item; }
    return this.createListItemFromData(data, true, state);
  }

  private getAnyPendingStateFor(data: TItem, isInSource: boolean): TItemState {
    const pendingStates = this._pendingStates.filter(i => i.id === data.id);
    if (pendingStates.length === 0) { return undefined; }
    this._pendingStates = this._pendingStates.except(pendingStates);
    return Object.merge<TItemState>({}, this.createStateForItem(data, isInSource), ...pendingStates.map(i => i.state));
  }

  //#endregion

}
