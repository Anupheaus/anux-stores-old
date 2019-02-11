import { ChangedDelegate } from './changedDelegate';
import { ICreateEventSubscribeOptions, Unsubscribe } from 'anux-common';

export interface IChangeable<TTarget extends IChangeable<TTarget, TState>, TState extends {} = {}> {
  onChanged(event: ChangedDelegate<TTarget, TState>, options?: ICreateEventSubscribeOptions): Unsubscribe;
}
