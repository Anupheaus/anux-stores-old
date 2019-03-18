import { SetStateAction, Dispatch } from 'react';
import { ICreateStoreApi, ICreateStoreResult, StoreSelector } from './models';
import { IMap } from 'anux-common';

interface ICreateStoreConfig<TProps extends {} = {}, TState extends {} = {}, TActions extends {} = {}> {
    state?: TState;
    selectors?: IMap<StoreSelector<TState, TActions, {}>>;
    actions?(setState: Dispatch<SetStateAction<TState>>, props: TProps): TActions;
    props?(props: TProps): TProps;

}

export function createStoreFactory<TProps extends {}, TState extends {}, TActions extends {}>(config: ICreateStoreConfig<TProps, TState, TActions>) {
    return {
        props: (defaultProps?: (props: TProps) => TProps) => createStoreFactory({ ...config, props: defaultProps }),
        selectors: (selectors: IMap<StoreSelector<TState, TActions, {}>>) => createStoreFactory({ ...config, selectors }),
        actions: (createActions: (setState: Dispatch<SetStateAction<TState>>, props: TProps) => TActions) => createStoreFactory({ ...config, actions: createActions }),
        state: (state: TState) => createStoreFactory({ ...config, state }),
    } as ICreateStoreApi<TProps, TState> & ICreateStoreResult<TProps, TState, TActions>;
}

export const createStore: ICreateStoreApi = createStoreFactory({});
