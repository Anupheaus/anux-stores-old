import { Dispatch, SetStateAction, FunctionComponent, ReactNode } from 'react';
import { Omit, IMap } from 'anux-common';

export interface ICreateStoreResult<TProps extends {} = {}, TState extends {}= {}, TActions extends {} = {}> {
    Provider: FunctionComponent<TProps>;
    Consumer: FunctionComponent<{ children(state: TState, actions: TActions): ReactNode; }>;
    Select(delegate: (state: TState) => TState): FunctionComponent;
}

export interface ICreateStoreApi<TProps extends {} = {}, TState extends {} = {}, TActions extends {} = {}> {
    props<TNewProps extends {}>(): Omit<ICreateStoreApi<TNewProps, TState, TActions>, 'props'>;
    props<TNewProps extends {}>(defaultProps: (props: TProps) => TProps): Omit<ICreateStoreApi<TNewProps, TState, TActions>, 'props'>;
    state<TNewState extends {}>(state: TNewState): Pick<ICreateStoreApi<TProps, TNewState, TActions>, 'actions' | 'selectors'>;
    actions<TNewActions extends {}>(createActions: (setState: Dispatch<SetStateAction<TState>>, props: TProps) => TNewActions):
        Pick<ICreateStoreApi<TProps, TState, TNewActions>, 'selectors'>;
    selectors(selectors: IMap<StoreSelector<TState, TActions, {}>>): ICreateStoreResult<TProps, TState, TActions>;
}

export type StoreSelector<TState extends {}, TActions extends {}, TSelection extends {}> = (state: TState, actions: TActions) => TSelection;
