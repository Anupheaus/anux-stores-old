import { Store } from './store';

describe('store', () => {

  interface IState {
    something: string;
  }

  class TestStore extends Store<IState> {

    public async updateSomething(something: string): Promise<void> {
      await this.setState({ something });
    }

    protected init() {
      /* do nothing */
    }

    protected async load(): Promise<void> {
      /* do nothing */
    }

    protected initialiseState(): IState {
      return {
        something: '',
      };
    }

    protected beforeStateUpdate(newState: IState, _prevState: IState): IState {
      return newState;
    }

    protected afterStateUpdate(_newState: IState, _prevState: IState): void {
      /* do nothing */
    }

  }

  function setupTest() {
    const store = new TestStore();

    return {
      store,
      dispose() {
        store.dispose();
      },
    };
  }

  describe('state', () => {

    it('can write to the state', async () => {
      const { store, dispose } = setupTest();

      expect(store.state.something).to.eq('');
      await store.updateSomething('test');
      expect(store.state.something).to.eq('test');

      dispose();
    });

    it('can grab the state before changes and update it', async () => {
      const { store, dispose } = setupTest();

      chai.spy.on(store, 'beforeStateUpdate');
      chai.spy.on(store, 'afterStateUpdate');
      expect(store['beforeStateUpdate']).not.to.have.been.called;
      const update = store.updateSomething('test');
      expect(store['beforeStateUpdate']).to.have.been.called.once.and.called.with.exactly({ something: 'test' }, { something: '' });
      expect(store['afterStateUpdate']).not.to.have.been.called;
      await update;
      expect(store['afterStateUpdate']).to.have.been.called.once.and.called.with.exactly({ something: 'test' }, { something: '' });

      chai.spy.restore(store, 'beforeStateUpdate');
      chai.spy.restore(store, 'afterStateUpdate');

      dispose();
    });

    it('can call setState with no new data and it does not raise any events', async () => {
      const { store, dispose } = setupTest();
      let changeCount = 0;
      store.onChanged(() => { changeCount++; }, { immediatelyInvoke: false });
      await store['setState'](store.state);
      expect(changeCount).to.eq(0);
      dispose();
    });

  });

  describe('init', () => {

    it('is called if declared', async () => {
      const { dispose } = setupTest();

      chai.spy.on(TestStore.prototype, 'init');
      const store = new TestStore();
      expect(store['init']).to.have.been.called.once;
      chai.spy.restore(TestStore.prototype, 'init');
      store.dispose();

      dispose();
    });

  });

  describe('load', () => {
    const { dispose } = setupTest();

    chai.spy.on(TestStore.prototype, 'load');
    const store = new TestStore();
    expect(store['load']).to.have.been.called.once;
    chai.spy.restore(TestStore.prototype, 'load');
    store.dispose();

    dispose();
  });

  describe('onChanged', () => {

    it('is called when subscribed and when changed', async () => {
      const { store, dispose } = setupTest();

      let callCount = 0;
      expect(callCount).to.eq(0);
      store.onChanged(() => {
        callCount++;
      });
      expect(callCount).to.eq(1);
      await store.updateSomething('test');
      expect(callCount).to.eq(2);

      dispose();
    });

    it('is called with the correct parameters', async () => {
      const { store, dispose } = setupTest();

      let target: TestStore;
      let newState: IState;
      let prevState: IState;
      store.onChanged((innerTarget, innerNewState, innerPrevState) => {
        target = innerTarget;
        newState = innerNewState;
        prevState = innerPrevState;
      });
      expect(target).to.eq(store);
      expect(newState).to.eq(prevState).and.to.eql({ something: '' });
      await store.updateSomething('test');
      expect(target).to.eq(store);
      expect(newState).to.eql({ something: 'test' }).and.not.to.eq(prevState);
      expect(prevState).to.eql({ something: '' });

      dispose();
    });

  });

  describe('recordSubscriptionTo', () => {

    it('can record a subscription and calls unsubscribe when the store is disposed', () => {
      const { store, dispose } = setupTest();
      let unsubscribeCalled = 0;
      store['recordSubscriptionTo'](() => { unsubscribeCalled++; });
      expect(unsubscribeCalled).to.eq(0);
      dispose();
      expect(unsubscribeCalled).to.eq(1);
    });

  });

});
