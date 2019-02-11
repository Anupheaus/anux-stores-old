import { Store } from '../store';

export type StateOf<TStore extends Store> = TStore['state'];
