import { Stores } from './stores';
import { Store } from './store';

describe('stores', () => {

  interface IState {

  }

  class TestStore extends Store<IState> {

    protected initialiseState(): IState {
      return {};
    }

  }

  function setupTest() {
    const stores = new Stores();
    return {
      stores,
      dispose() {
        stores.dispose();
      },
    };
  }

  describe('get', () => {

    it('can create a store', () => {
      const { stores, dispose } = setupTest();

      const store = stores.get(TestStore);
      expect(store).to.be.instanceOf(TestStore);
      expect(store.state).to.be.instanceOf(Object);

      dispose();
    });

    it('can return the same instance of a store once created', () => {
      const { stores, dispose } = setupTest();

      const store1 = stores.get(TestStore);
      const store2 = stores.get(TestStore);

      expect(store1).to.eq(store2);

      dispose();
    });

    it('will always return a new instance if requested', () => {
      const { stores, dispose } = setupTest();

      const store1 = stores.get(TestStore, { alwaysNew: true });
      const store2 = stores.get(TestStore, { alwaysNew: true });

      expect(store1).not.to.eq(store2);

      dispose();
    });

    it('will not auto-create a new instance if not requested to', () => {
      const { stores, dispose } = setupTest();

      const store1 = stores.get(TestStore, { autoCreate: false });
      expect(store1).to.be.undefined;

      dispose();
    });

    it('will not cache a new instance if not requested to', () => {
      const { stores, dispose } = setupTest();

      expect(stores).to.have.lengthOf(0);
      const store1 = stores.get(TestStore, { cacheStore: false });
      expect(store1).to.be.instanceOf(TestStore);
      expect(stores).to.have.lengthOf(0);

      dispose();
    });

    it('if a store created from it is disposed, it will remove the store', () => {
      const { stores, dispose } = setupTest();

      expect(stores).to.have.lengthOf(0);
      const store = stores.get(TestStore);
      expect(stores).to.have.lengthOf(1);
      store.dispose();
      expect(stores).to.have.lengthOf(0);

      dispose();
    });

    it('can get an store with an index', () => {
      const { stores, dispose } = setupTest();

      const store1 = stores.get(TestStore);
      const store2 = stores.get(0);
      expect(store1).to.eq(store2);

      dispose();
    });

  });

  describe('remove', () => {

    it('can remove a store', () => {
      const { stores, dispose } = setupTest();

      expect(stores).to.have.lengthOf(0);
      const store = stores.get(TestStore);
      expect(stores).to.have.lengthOf(1);
      stores.remove(store);
      expect(stores).to.have.lengthOf(0);

      dispose();
    });

    it('fails silently if the store being removed cannot be found', () => {
      const { stores, dispose } = setupTest();

      const store = stores.get(TestStore);
      stores.remove(store);
      expect(() => {
        stores.remove(store);
      }).not.to.throw();

      dispose();
    });

  });

  describe('dispose', () => {

    it('can be disposed and calls the onDisposed event', () => {
      const { stores } = setupTest();

      let hasBeenDisposed = false;
      stores.onDisposed(() => { hasBeenDisposed = true; });
      stores.dispose();
      expect(hasBeenDisposed).to.be.true;
      expect(stores['_unsubscriptions']).to.be.undefined;
      expect(stores['_stores']).to.be.undefined;
      expect(stores['_onDisposed']).to.be.undefined;
    });

    it('disposes any stores that have been created with it as well', () => {
      const { stores } = setupTest();

      let storeHasBeenDisposed = false;
      const store = stores.get(TestStore);
      store.onDisposed(() => { storeHasBeenDisposed = true; });
      stores.dispose();
      expect(storeHasBeenDisposed).to.be.true;
    });

  });

});
