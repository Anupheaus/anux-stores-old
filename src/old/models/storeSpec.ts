import { ConstructorOf } from 'anux-common';
import { Store } from '../store';

export interface IOnCreateHelpers {
  getLatest<TStore extends Store>(type: ConstructorOf<TStore>): TStore;
  getFirst<TStore extends Store>(type: ConstructorOf<TStore>): TStore;
  getFromParent<TStore extends Store>(type: ConstructorOf<TStore>): TStore;
}

export interface IStoreSpec<TStore extends Store = Store> {
  type: ConstructorOf<TStore>;
  alwaysNew?: boolean;
  onCreate?(helpers: IOnCreateHelpers): TStore;
}
