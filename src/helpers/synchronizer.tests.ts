import { Store } from '../stores';
import { Synchronizer } from './synchronizer';
import { Upsertable, DeepPartial } from 'anux-common';

// tslint:disable:max-classes-per-file
// tslint:disable:no-unused-expression-chai

interface IItemA {
  id: string;
  name: string;
}

interface IStateA {
  items: IItemA[];
}

class StoreA extends Store<IStateA> {

  public async upsertItem(item: Upsertable<IItemA>): Promise<void> {
    let { items } = this.state;
    items = items.upsert(item);
    await this.setState({ items });
  }

  public async removeItemById(id: string): Promise<void> {
    let { items } = this.state;
    items = items.removeById(id);
    await this.setState({ items });
  }

  protected initialiseState(): IStateA {
    return {
      items: [],
    };
  }

}

interface IItemB {
  data: IItemA;
  state: {
    isDirty: boolean;
  };
}

interface IUpsertableItemB extends DeepPartial<IItemB> {
  data: {
    id: string;
  } & DeepPartial<IItemB['data']>;
}

interface IStateB {
  items: IItemB[];
}

class StoreB extends Store<IStateB> {

  public async upsertItem(item: IUpsertableItemB): Promise<void> {
    let { items } = this.state;
    items = items.upsertWhere(i => i.data.id === item.data.id, () => item);
    await this.setState({ items });
  }

  protected initialiseState(): IStateB {
    return {
      items: [],
    };
  }

}

class TestSynchronizer extends Synchronizer<StoreA, IItemA, StoreB, IItemB> {
  constructor() {
    super({
      getLeftItems: store => store.state.items,
      setLeftItems: (items: IItemA[]) => ({ items }),
      getRightItems: store => store.state.items,
      setRightItems: (items: IItemB[]) => ({ items }),
      matchBy: (itemA, itemB) => itemA.id === itemB.data.id,
      addItemFromLeft: item => ({ data: item, state: { isDirty: false } }),
      addItemFromRight: item => item.data,
      canAddItemFromRight: item => !item.state.isDirty,
      removeItemFromRight: (itemB, itemA) => !!itemA || !itemB.state.isDirty,
    });
  }

}

function setupTest() {
  const storeA = new StoreA();
  const storeB = new StoreB();
  let sync: TestSynchronizer;
  return {
    storeA,
    storeB,
    async init() {
      sync = new TestSynchronizer();
      await sync.init(storeA, storeB);
      return sync;
    },
    dispose() {
      storeA.dispose();
      storeB.dispose();
      if (sync) { sync.dispose(); }
    },
  };
}

describe('synchronizer', () => {

  it('synchronizes immediately and correctly', async () => {
    const { storeA, storeB, init, dispose } = setupTest();
    await storeA.upsertItem({ id: Math.uniqueId(), name: 'something' });
    expect(storeB.state.items).to.have.lengthOf(0);
    await init();
    expect(storeB.state.items).to.have.lengthOf(1);
    dispose();
  });

  it('throws an error if you try to init more than once', async () => {
    const { init, dispose } = setupTest();
    const synchronizer = await init();
    try {
      await synchronizer.init(null, null);
    } catch (error) {
      expect(error.message).to.eq('You cannot call the init method on this synchronizer more than once.');
    }
    dispose();
  });

  it('does not synchronise dirty items back to store A', async () => {
    const { storeA, storeB, init, dispose } = setupTest();
    await storeB.upsertItem({ data: { id: Math.uniqueId(), name: 'something' }, state: { isDirty: true } });
    expect(storeA.state.items).to.have.lengthOf(0);
    await init();
    expect(storeA.state.items).to.have.lengthOf(0);
    dispose();
  });

  it('synchronises store B with updates to store A', async () => {
    const { storeA, storeB, init, dispose } = setupTest();
    await init();
    expect(storeA.state.items).to.have.lengthOf(0);
    expect(storeB.state.items).to.have.lengthOf(0);
    await storeA.upsertItem({ id: Math.uniqueId(), name: 'something else' });
    expect(storeA.state.items).to.have.lengthOf(1);
    expect(storeB.state.items).to.have.lengthOf(1);
    dispose();
  });

  it('synchronises store A with updates to store B', async () => {
    const { storeA, storeB, init, dispose } = setupTest();
    await init();
    expect(storeA.state.items).to.have.lengthOf(0);
    expect(storeB.state.items).to.have.lengthOf(0);
    await storeB.upsertItem({ data: { id: Math.uniqueId(), name: 'something else' }, state: { isDirty: false } });
    expect(storeA.state.items).to.have.lengthOf(1);
    expect(storeB.state.items).to.have.lengthOf(1);
    dispose();
  });

  it('does not remove dirty items when synchronising from store A', async () => {
    const { storeA, storeB, init, dispose } = setupTest();
    await init();
    await storeB.upsertItem({ data: { id: Math.uniqueId(), name: 'something' }, state: { isDirty: true } });
    expect(storeA.state.items).to.have.lengthOf(0);
    expect(storeB.state.items).to.have.lengthOf(1);
    await storeA.upsertItem({ id: Math.uniqueId(), name: 'something else' });
    expect(storeA.state.items).to.have.lengthOf(1);
    expect(storeB.state.items).to.have.lengthOf(2);
    dispose();
  });

  it('handles removal of items from store A and does not affect dirty items in store B', async () => {
    const { storeA, storeB, init, dispose } = setupTest();
    await init();
    const id = Math.uniqueId();
    await storeA.upsertItem({ id, name: 'something else' });
    await storeB.upsertItem({ data: { id: Math.uniqueId(), name: 'something' }, state: { isDirty: true } });
    expect(storeA.state.items).to.have.lengthOf(1);
    expect(storeB.state.items).to.have.lengthOf(2);
    await storeA.removeItemById(id);
    expect(storeA.state.items).to.have.lengthOf(0);
    expect(storeB.state.items).to.have.lengthOf(1);
    dispose();
  });

});
