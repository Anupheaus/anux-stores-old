import { ConstructorOf } from 'anux-common';
import { IChangeable } from './changed';

export type SelectorTarget<TSelf extends IChangeable<TSelf>> = ConstructorOf<TSelf> & IChangeable<TSelf>;
