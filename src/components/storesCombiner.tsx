import { PureComponent } from 'react';
import { IStoreSpec } from '../models';
import { Store } from '../stores';
import { AnuxContext } from '../context';

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

  public static getDerivedStateFromProps(props: IProps, state: IState): IState {
    let { stores } = state;
    const { configuration, stores: parentStores } = props;

    const newStores = [];
    configuration.forEach(({ type, onCreate, alwaysNew }) => {
      let store = stores.find(i => i instanceof type);
      if (!store && !alwaysNew) { store = parentStores.find(i => i instanceof type); }
      if (!store) {
        if (!onCreate) { onCreate = () => new type(); }
        store = onCreate();
      }
      newStores.push(store);
    });

    if (!newStores.equals(stores)) { stores = newStores; }

    return {
      stores,
    };
  }

  //#endregion

}
