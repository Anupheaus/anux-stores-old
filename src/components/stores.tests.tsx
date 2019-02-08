import { mount } from 'enzyme';
import { Stores } from './stores';
import { Store } from '../stores';
import { PureComponent } from 'react';
import { AnuxContext } from '../context';

describe('Stores', () => {

  interface IState { }

  class TestStore extends Store<IState> {

    protected initialiseState(): IState {
      return {

      };
    }

  }

  interface IProps {
    onGetStore(store: Store): void;
  }

  class TestComponent extends PureComponent<IProps> {

    public render() {
      const { onGetStore } = this.props;
      return (
        <AnuxContext.Consumer>
          {stores => {
            onGetStore(stores[0]);
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
    mount((
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
  });

});
