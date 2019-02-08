import { SelectionDelegate, RenderDelegate, IChangeable } from '../models';
import { ConstructorOf } from 'anux-common';
import { SelectorComponent } from './selectorComponent';
import { AnuxContext } from '../context';

interface IRender<TSelection extends {}> {
  render(delegate: (selection: TSelection) => React.ReactNode): React.ReactNode;
}

interface ISelectorFrom<TTarget extends IChangeable<TTarget>> {
  select<TSelection>(delegate: SelectionDelegate<TTarget, TSelection>): IRender<TSelection>;
}

interface ISelector {
  from<TTarget extends IChangeable<TTarget>>(target: ConstructorOf<TTarget>): ISelectorFrom<TTarget>;
}

class Selector<TTarget extends IChangeable<TTarget>> implements ISelectorFrom<TTarget>, IRender<any> {
  constructor(target: ConstructorOf<TTarget>) {
    this._target = target;
  }

  //#region Variables

  private _target: ConstructorOf<TTarget>;
  private _selector: SelectionDelegate<TTarget, any>;

  //#endregion

  //#region Methods

  public select<TSelection>(delegate: SelectionDelegate<TTarget, TSelection>): any {
    this._selector = delegate;
    return this;
  }

  public render(delegate: RenderDelegate<any>): React.ReactNode {
    return (
      <AnuxContext.Consumer>
        {stores => (
          <SelectorComponent
            target={stores.find(store => store instanceof this._target)}
            selector={this._selector}
            render={delegate}
          />
        )}
      </AnuxContext.Consumer>
    );
  }

  //#endregion
}

const selector: ISelector = {

  from<TTarget extends IChangeable<TTarget>>(target: ConstructorOf<TTarget>): ISelectorFrom<TTarget> {
    return new Selector(target);
  },

};

export { selector };
