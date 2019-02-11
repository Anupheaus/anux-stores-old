import { Component } from 'react';
import { SelectionDelegate, IChangeable, RenderDelegate } from '../models';
import { IMap, Unsubscribe, InternalError } from 'anux-common';

interface IProps {
  target: IChangeable<any>;
  selector: SelectionDelegate<any, any>;
  render: RenderDelegate<any>;
}

interface IState {
  selection: IMap;
  element: React.ReactNode;
}

export class SelectorComponent extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      element: undefined,
      selection: undefined,
    };
  }

  //#region Variables

  private _unsubscribe: Unsubscribe;

  //#endregion

  //#region Methods

  public render() {
    const { element } = this.state;
    return element;
  }

  public static getDerivedStateFromProps(props: IProps, state: IState): IState {
    let { element, selection } = state;
    const { target, selector, render } = props;

    if (!target) {
      throw new InternalError('The store required to select from cannot be found within the stores available.');
    } else {
      const newSelection = selector(target);
      if (!element || !Reflect.areShallowEqual(selection, newSelection)) {
        selection = newSelection;
        element = render(selection);
      }
    }

    return { element, selection };
  }

  public componentDidMount(): void {
    this.subscribeToTarget();
  }

  public componentDidUpdate(prevProps: IProps) {
    const { target: prevTarget } = prevProps;
    const { target } = this.props;

    if (target !== prevTarget) {
      this.unsubscribeFromTarget();
      this.subscribeToTarget();
    }
  }

  public shouldComponentUpdate(_nextProps: IProps, nextState: IState): boolean {
    return !Reflect.areShallowEqual(nextState, this.state);
  }

  public componentWillUnmount(): void {
    this.unsubscribeFromTarget();
  }

  private subscribeToTarget(): void {
    if (this._unsubscribe) { return; }
    const { target } = this.props;
    if (!target) { return; }
    this._unsubscribe = target.onChanged(innerTarget => {
      const state = SelectorComponent.getDerivedStateFromProps({ ...this.props, target: innerTarget }, this.state);
      this.setState(state);
    }, { immediatelyInvoke: false });
  }

  private unsubscribeFromTarget(): void {
    if (!this._unsubscribe) { return; }
    this._unsubscribe();
    this._unsubscribe = undefined;
  }

  //#endregion

}
