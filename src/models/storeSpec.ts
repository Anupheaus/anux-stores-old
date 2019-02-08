import { ConstructorOf } from 'anux-common';
import { Store } from '../stores';

export interface IStoreSpec<TStore extends Store = Store> {
  type: ConstructorOf<TStore>;
  alwaysNew?: boolean;
  onCreate?(): TStore;
}
