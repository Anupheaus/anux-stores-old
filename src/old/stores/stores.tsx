import { PureComponent } from 'react';
import { Store } from '../store';
import { AnuxContext } from '../context';
import { IStoreSpec } from '../models';
import { StoresCombiner } from './storesCombiner';
import { ConstructorOf } from 'anux-common';

interface IProps {
  configuration: (ConstructorOf<Store> | IStoreSpec)[];
}

export class Stores extends PureComponent<IProps> {

  //#region Methods

  public render() {
    const { configuration, children } = this.props;
    const configurationSpecs: IStoreSpec[] = configuration.map(config => typeof (config) === 'function' ? { type: config } : config);
    return (
      <AnuxContext.Consumer >
        {stores => (
          <StoresCombiner
            configuration={configurationSpecs}
            stores={stores}
          >
            {children || null}
          </StoresCombiner>
        )}
      </AnuxContext.Consumer >
    );
  }

  //#endregion

}
