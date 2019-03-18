import { ICreateStoreConfig } from './models';
import { FunctionComponent } from 'react';

export function createProvider<TState extends {}, TProps extends {}>(config: ICreateStoreConfig<TState, TProps>) {
    const Provider: FunctionComponent<TProps> = (props) => {

        return null;
    };
    return Provider;
}