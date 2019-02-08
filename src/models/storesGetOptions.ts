import { Store } from '../stores';

export interface IStoresGetOptions<TStore extends Store = Store> {
  autoCreate?: boolean;
  cacheStore?: boolean;
  alwaysNew?: boolean;
  onCreate?(): TStore;
}
