import { PromiseMaybe, Unsubscribe, ICreateEventSubscribeOptions } from 'anux-common';

export type ChangedDelegate<TTarget extends IChangeable<TTarget, TState>, TState extends {} = {}> = (target: TTarget, newState: TState, prevState: TState) => PromiseMaybe;

export interface IChangeable<TTarget extends IChangeable<TTarget, TState>, TState extends {} = {}> {
  onChanged(event: ChangedDelegate<TTarget, TState>, options?: ICreateEventSubscribeOptions): Unsubscribe;
}
