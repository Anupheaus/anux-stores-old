import { PureComponent } from 'react';
import { IStoreSpec } from '../models';
import { Store } from '../store';
import { AnuxContext } from '../context';
import { ConstructorOf } from 'anux-common';

interface IProps {
  configuration: IStoreSpec[];
  stores: Store[];
}

interface IState {
  stores: Store[];
}

export class StoresCombiner extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      stores: [],
    };
  }

  //#region Methods

  public render() {
    const { children } = this.props;
    const { stores } = this.state;

    return (
      <AnuxContext.Provider
        value={stores}
      >
        {children}
      </AnuxContext.Provider>
    );
  }

  public componentWillUnmount(): void {
    const { stores } = this.state;
    stores.forEach(store => store.dispose());
  }

  public static getDerivedStateFromProps(props: IProps, state: IState): IState {
    let { stores } = state;
    const { configuration, stores: parentStores } = props;

    const newStores = [];
    configuration.forEach(({ type, onCreate, alwaysNew }) => {
      let store = stores.find(i => i instanceof type);
      if (!store && !alwaysNew) { store = parentStores.find(i => i instanceof type); }
      if (!store) {
        if (!onCreate) { onCreate = () => new type(); }
        const allStores = parentStores.concat(newStores);
        store = onCreate({
          getLatest: StoresCombiner.getLast(allStores),
          getFirst: StoresCombiner.getFirst(allStores),
          getFromParent: StoresCombiner.getLast(parentStores),
        });
      }
      newStores.push(store);
    });

    if (!newStores.equals(stores)) { stores = newStores; }

    return {
      stores,
    };
  }

  private static getFirst<TStore extends Store>(stores: Store[]): (type: ConstructorOf<TStore>) => TStore {
    return type => stores.firstOrDefault(store => store instanceof type) as TStore;
  }

  private static getLast<TStore extends Store>(stores: Store[]): (type: ConstructorOf<TStore>) => TStore {
    return type => stores.lastOrDefault(store => store instanceof type) as TStore;
  }

  //#endregion

}
