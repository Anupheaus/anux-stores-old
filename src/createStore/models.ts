import { Dispatch, SetStateAction, FunctionComponent, ReactNode } from 'react';
import { Omit } from 'anux-common';

export interface ICreateStoreResultSelection<TSelection extends {}> {
    render(delegate: (selection: TSelection) => React.ReactNode): React.ReactNode;
}

export interface ICreateStoreResult<TProps extends {} = {}, TState extends {}= {}, TActions extends {} = {}> {
    Provider: FunctionComponent<TProps>;
    Consumer: FunctionComponent<{ children(state: TState, actions: TActions): ReactNode; }>;
    select<TSelection>(delegate: (state: TState, actions: TActions) => TSelection): ICreateStoreResultSelection<TSelection>;
}

export interface ICreateStoreApi<TProps extends {} = {}, TState extends {} = {}> {
    props<TNewProps extends {}>(): Omit<ICreateStoreApi<TNewProps, TState>, 'props'>;
    props<TNewProps extends {}>(defaultProps: (props: TProps) => TProps): Omit<ICreateStoreApi<TNewProps, TState>, 'props'>;
    state<TNewState extends {}>(state: TNewState): Pick<ICreateStoreApi<TProps, TNewState>, 'actions'>;
    actions<TActions extends {}>(createActions: (setState: Dispatch<SetStateAction<TState>>, props: TProps) => TActions): ICreateStoreResult<TProps, TState, TActions>;
}

export type StoreSelector<TState extends {}, TActions extends {}, TSelection extends {}> = (state: TState, actions: TActions) => TSelection;
