import { Store } from '../store';
import { Unsubscribe, InternalError, DeepPartial } from 'anux-common';
import { StateOf } from '../models';

enum SyncSides {
  Left,
  Right,
}

type SetItems<TStore extends Store, TItem extends {}> = ((items: TItem[]) => DeepPartial<StateOf<TStore>>) | ((items: TItem[], store: TStore) => Promise<void>);

export interface ISynchronizerMappings<TLeftStore extends Store, TLeftItem extends {}, TRightStore extends Store, TRightItem extends {}> {
  setLeftItems: SetItems<TLeftStore, TLeftItem>;
  setRightItems: SetItems<TRightStore, TRightItem>;
  getLeftItems(store: TLeftStore): TLeftItem[];
  getRightItems(store: TRightStore): TRightItem[];

  leftStore?(): TLeftStore;
  rightStore?(): TRightStore;
  matchBy?(leftItem: TLeftItem, rightItem: TRightItem): boolean;
  canAddItemFromLeft?(leftItem: TLeftItem): boolean;
  canAddItemFromRight?(rightItem: TRightItem): boolean;
  addItemFromLeft?(leftItem: TLeftItem): TRightItem;
  addItemFromRight?(rightItem: TRightItem): TLeftItem;
  removeItemFromLeft?(leftItem: TLeftItem, rightItem: TRightItem): boolean;
  removeItemFromRight?(rightItem: TRightItem, leftItem: TLeftItem): boolean;
  updateLeftItemFromRight?(rightItem: TRightItem, leftItem: TLeftItem): TLeftItem;
  updateRightItemFromLeft?(leftItem: TLeftItem, rightItem: TRightItem): TRightItem;
}

export abstract class Synchronizer<TLeftStore extends Store = Store, TLeftItem extends {} = {}, TRightStore extends Store = Store, TRightItem extends {} = {}> {
  constructor(mappings: ISynchronizerMappings<TLeftStore, TLeftItem, TRightStore, TRightItem>) {
    this._store = [];
    this._unsubscribe = [];
    this._initAlreadyDone = false;
    this._mappings = {
      leftStore: this.createStoreStub<TLeftStore>(SyncSides.Left),
      rightStore: this.createStoreStub<TRightStore>(SyncSides.Right),
      matchBy: this.createMatchByStub(),
      canAddItemFromLeft: this.createCanAddItemFromStub(),
      canAddItemFromRight: this.createCanAddItemFromStub(),
      addItemFromLeft: this.createAddItemFromStub(),
      addItemFromRight: this.createAddItemFromStub(),
      removeItemFromLeft: this.createRemoveItemFromStub(),
      removeItemFromRight: this.createRemoveItemFromStub(),
      updateLeftItemFromRight: this.createUpdateItemFromStub(),
      updateRightItemFromLeft: this.createUpdateItemFromStub(),
      ...mappings,
    };
    Object.keys(this._mappings).forEach(key => { this._mappings[key] = this._mappings[key].bind(this); });
  }

  //#region Variables

  private _store: Store[];
  private _unsubscribe: Unsubscribe[];
  private _initAlreadyDone: boolean;
  private _mappings: ISynchronizerMappings<TLeftStore, TLeftItem, TRightStore, TRightItem>;

  //#endregion

  //#region Properties

  //#endregion

  //#region Methods

  public async init(leftStore: TLeftStore, rightStore: TRightStore): Promise<void> {
    if (this._initAlreadyDone) { throw new InternalError('You cannot call the init method on this synchronizer more than once.'); }
    this._initAlreadyDone = true;
    this._store[SyncSides.Left] = leftStore;
    this._store[SyncSides.Right] = rightStore;
    await this.subscribeTo(SyncSides.Left, true);
    await this.subscribeTo(SyncSides.Right, false);
  }

  public dispose(): void {
    if (this._unsubscribe) { this._unsubscribe.forEach(unsubscribe => unsubscribe()); }
    this._unsubscribe = undefined;
    this._store = undefined;
    this._mappings = undefined;
  }

  private createStoreStub<TStore extends Store>(side: SyncSides): () => TStore {
    return () => this._store[side] as TStore;
  }

  private createMatchByStub() {
    return (leftItem: TLeftItem, rightItem: TRightItem) =>
      (leftItem === rightItem as any)
      || (leftItem && leftItem['id'] && rightItem && rightItem['id'] && leftItem['id'] === rightItem['id']);
  }

  private createCanAddItemFromStub() {
    return () => true;
  }

  private createAddItemFromStub() {
    return (item: any) => item;
  }

  private createRemoveItemFromStub() {
    return (_firstItem: any, secondItem: any) => !!secondItem;
  }

  private createUpdateItemFromStub() {
    return (_firstItem: any, secondItem: any) => secondItem;
  }

  private async subscribeTo(side: SyncSides, syncImmediately: boolean): Promise<void> {
    let lastItems: {}[] = [];
    const getThisSideItems = this.createGetItemsDelegate(side);
    const getOtherSideItems = this.createGetItemsDelegate(1 - side);
    const setItems = this.createSetItemsDelegate(side);
    const matchBy = this.createMatchByDelegate(side);
    const canAddItem = this.createCanAddItemDelegate(side);
    const addItem = this.createAddItemDelegate(side);
    const removeItem = this.createRemoveItemDelegate(side, lastItems, matchBy);
    const updateItem = this.createUpdateItemDelegate(side);
    this._store[side].onDisposed(this.createDisposeStoreDelegate(side));
    await new Promise(resolve => {
      this._unsubscribe[side] = this._store[side].onChanged(async () => {
        const thisSideItems = getThisSideItems();
        if (lastItems.equals(thisSideItems)) { resolve(); return; }
        const otherSideItems = getOtherSideItems();
        await this.internalSynchronize(thisSideItems, otherSideItems, matchBy, setItems, canAddItem, addItem, removeItem, updateItem);
        lastItems = getThisSideItems();
        resolve();
      }, { immediatelyInvoke: syncImmediately });
      if (!syncImmediately) { resolve(); }
    });
  }

  private async internalSynchronize(sourceItems: {}[], destItems: {}[], matchBy: (sourceItem: {}, destItem: {}) => boolean, setItems: (items: {}[]) => Promise<void>,
    canAddItem: (item: {}) => boolean, addItem: (item: {}) => {}, removeItem: (item: {}) => boolean, updateItem: (sourceItem: {}, destItem: {}) => {}): Promise<void> {
    const newDestItems = destItems.mergeWith(sourceItems, {
      matchBy,
      createBy: addItem,
      removeUnmatched: removeItem,
      addNew: canAddItem,
      updateMatched: updateItem,
      matchOrder: true,
    });
    if (newDestItems.length === destItems.length && newDestItems.equals(destItems)) { return; }
    await setItems(newDestItems);
  }

  private createGetItemsDelegate(side: SyncSides) {
    const delegate: (store: Store) => {}[] = side === SyncSides.Left ? this._mappings.getLeftItems : this._mappings.getRightItems;
    const store = this._store[side];
    return () => delegate(store);
  }

  private createSetItemsDelegate(side: SyncSides) {
    const store = this._store[1 - side];
    const delegate: { (items: {}[]): {}; (items: {}[], store: Store): Promise<void> } = side === SyncSides.Left ? this._mappings.setLeftItems
      : this._mappings.setRightItems as any;
    return async (items: {}[]) => {
      if (delegate.length === 1) {
        await store['setState'](delegate(items));
      } else if (delegate.length === 2) {
        await delegate(items, store);
      }
    };
  }

  private createMatchByDelegate(side: SyncSides) {
    return (a: any, b: any) => side === SyncSides.Left ? this._mappings.matchBy(b, a) : this._mappings.matchBy(a, b);
  }

  private createCanAddItemDelegate(side: SyncSides): (item: any) => boolean {
    return side === SyncSides.Left ? this._mappings.canAddItemFromLeft : this._mappings.canAddItemFromRight;
  }

  private createAddItemDelegate(side: SyncSides): (firstItem: any) => any {
    return side === SyncSides.Left ? this._mappings.addItemFromLeft : this._mappings.addItemFromRight;
  }

  private createRemoveItemDelegate(side: SyncSides, lastItems: any[], matchBy: (a: any, b: any) => boolean) {
    const delegate: (leftItem: {}, rightItem: {}) => boolean = side === SyncSides.Left ? this._mappings.removeItemFromRight : this._mappings.removeItemFromLeft;
    return (destItem: any) => {
      const sourceItem = lastItems.find(i => matchBy(destItem, i));
      return delegate(destItem, sourceItem);
    };
  }

  private createUpdateItemDelegate(side: SyncSides) {
    const delegate: (leftItem: {}, rightItem: {}) => {} = side === SyncSides.Left ? this._mappings.updateRightItemFromLeft : this._mappings.updateLeftItemFromRight;
    return (a: any, b: any) => delegate(b, a);
  }

  private createDisposeStoreDelegate(side: SyncSides) {
    return () => { this._store[side] = undefined; };
  }

  //#endregion
}
