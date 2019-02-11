import { PromiseMaybe } from 'anux-common';
import { IChangeable } from './changeable';

export type ChangedDelegate<TTarget extends IChangeable<TTarget, TState>, TState extends {} = {}> = (target: TTarget, newState: TState, prevState: TState) => PromiseMaybe;
