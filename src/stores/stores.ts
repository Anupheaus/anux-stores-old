import { ConstructorOf, createEventUnsubscribeCache, createEvent } from 'anux-common';
import { Store } from './store';
import { DisposedDelegate, IStoresGetOptions } from '../models';

export class Stores {

  //#region Variables

  private _stores: Store[] = [];
  private _unsubscriptions = createEventUnsubscribeCache();
  private _onDisposed = createEvent<DisposedDelegate>();

  //#endregion

  //#region Properties

  public get length() { return this._stores.length; }

  public get onDisposed() { return this._onDisposed.subscribe; }

  //#endregion

  //#region Methods

  public get<TStore extends Store>(type: ConstructorOf<TStore>): TStore;
  public get<TStore extends Store>(type: ConstructorOf<TStore>, options: IStoresGetOptions): TStore;
  public get(index: number): Store;
  public get<TStore extends Store>(...args: any[]): Store | TStore {
    const index = args.length === 1 && typeof (args[0]) === 'number' ? args[0] : undefined;
    const type = args.length >= 1 && typeof (args[0]) === 'function' ? args[0] : undefined;
    let options = args.length >= 2 && typeof (args[1]) === 'object' ? args[1] : {};

    if (index >= 0) { return this._stores[index]; }

    options = {
      autoCreate: true,
      cacheStore: true,
      alwaysNew: false,
      ...options,
    };

    let store: TStore = null;
    if (!options.alwaysNew) { store = this._stores.find(instance => instance instanceof type) as TStore; }
    if (!store && (options.autoCreate || options.alwaysNew)) {
      store = this.createNewStore(type, options.args || []);
    }
    if (store && options.cacheStore && !this._stores.includes(store)) { this._stores.push(store); }
    return store;
  }

  public remove(store: Store): void {
    const index = this._stores.indexOf(store);
    if (index === -1) { return; }
    this._stores.splice(index, 1);
  }

  public dispose(): void {
    this._stores.forEach(store => store.dispose());
    this._unsubscriptions.unsubscribeAllAndDispose();
    this._onDisposed.invoke();
    this._onDisposed.dispose();
    this._onDisposed = undefined;
    this._unsubscriptions = undefined;
    this._stores = undefined;
  }

  protected createNewStore<TStore extends Store>(type: ConstructorOf<TStore>, args: any[]): TStore {
    const store = new type(...args);
    this._unsubscriptions.add(store.onDisposed(() => this.remove(store)));
    return store;
  }

  //#endregion

}
