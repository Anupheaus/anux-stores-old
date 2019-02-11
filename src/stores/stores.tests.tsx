import { mount } from 'enzyme';
import { Stores } from './stores';
import { Store } from '../store';
import { PureComponent } from 'react';
import { AnuxContext } from '../context';

// tslint:disable:max-classes-per-file

describe('Stores', () => {

  interface IState { }

  class TestStore extends Store<IState> {

    protected initialiseState(): IState {
      return {

      };
    }

  }

  class TestStore2 extends Store<IState> {

    private _firstStore: TestStore;

    public get firstStore() { return this._firstStore; }

    protected init(firstStore: TestStore): void {
      this._firstStore = firstStore;
    }

    protected initialiseState(): IState {
      return {

      };
    }

  }

  interface IProps {
    storeIndex?: number;
    onGetStore(store: Store): void;
  }

  class TestComponent extends PureComponent<IProps> {

    public render() {
      const { onGetStore, storeIndex = 0 } = this.props;
      return (
        <AnuxContext.Consumer>
          {stores => {
            onGetStore(stores[storeIndex]);
            return null;
          }}
        </AnuxContext.Consumer>
      );
    }

  }

  it('allows getting and hosting a store', () => {
    let store: Store;
    let countOfOnCreate = 0;
    let countOfStoreSet = 0;

    expect(store).to.be.undefined;
    const component = mount((
      <Stores
        configuration={[
          {
            type: TestStore,
            onCreate: () => {
              countOfOnCreate++;
              return new TestStore();
            },
          },
        ]}
      >
        <TestComponent
          onGetStore={i => {
            store = i;
            countOfStoreSet++;
          }}
        />
      </Stores>
    ));
    expect(store).to.be.instanceOf(TestStore);
    expect(countOfOnCreate).to.eq(1);
    expect(countOfStoreSet).to.eq(1);
    component.unmount();
  });

  it('can get the latest store of a type', () => {
    let store: TestStore2;

    expect(store).to.be.undefined;
    const component = mount((
      <Stores
        configuration={[
          TestStore,
          { type: TestStore2, onCreate: ({ getLatest }) => new TestStore2(getLatest(TestStore)) },
        ]}
      >
        <TestComponent
          storeIndex={1}
          onGetStore={i => { store = i as any; }}
        />
      </Stores>
    ));
    expect(store).to.be.instanceOf(TestStore2);
    expect(store.firstStore).to.be.instanceOf(TestStore);
    component.unmount();
  });

});
