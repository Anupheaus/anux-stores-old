import { IChangeable } from './changed';
import { IStoresGetOptions } from './storesGetOptions';

export interface ISelectorFromOptions<TTarget extends IChangeable<TTarget>> extends IStoresGetOptions {
  cacheAtRoot?: boolean;
}
