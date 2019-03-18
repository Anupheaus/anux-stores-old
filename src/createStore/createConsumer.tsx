import { ICreateStoreConfig } from './models';
import { FunctionComponent, ReactNode } from 'react';

export interface IProps<TState extends {}, TActions extends {}> {
    children(selection: TState, actions: TActions): ReactNode;
}

export function createConsumer<TState extends {}, TActions extends {}>(config: ICreateStoreConfig) {
    const Consumer: FunctionComponent<IProps<TState, TActions>> = ({ }) => {
        return null;
    };
    return Consumer;
}