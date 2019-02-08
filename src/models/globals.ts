import { Store } from '../stores';

export type StateOf<TStore extends Store> = TStore['state'];
