import { createEvent, IDisposable, createEventUnsubscribeCache, Unsubscribe } from 'anux-common';
import { ChangedDelegate, IChangeable, DisposedDelegate } from '../models';

export abstract class Store<TState extends {} = {}> implements IDisposable, IChangeable<Store<TState>, TState> {
  constructor();
  constructor(...args: any[]);
  constructor(...args: any[]) {
    if (this.init) { this.init(...args); }
    this._state = this.initialiseState();
    if (this.load) { this.load(); }
  }

  //#region Variables

  private _state: TState;
  private _onChanged = createEvent<ChangedDelegate<this, TState>>({
    onSubscribe: delegate => delegate(this, this.state, this.state),
  });
  private _onDisposed = createEvent<DisposedDelegate>();
  private _unsubscriptions = createEventUnsubscribeCache();

  //#endregion

  //#region Properties

  public get state(): Readonly<TState> { return this._state; }

  public get onChanged() { return this._onChanged.subscribe; }

  public get onDisposed() { return this._onDisposed.subscribe; }

  //#endregion

  //#region Methods

  public dispose(): void {
    this._state = null;
    this._onDisposed.invoke();
    this._onDisposed.dispose();
    this._onDisposed = null;
    this._unsubscriptions.unsubscribeAllAndDispose();
    this._unsubscriptions = null;
  }

  protected abstract initialiseState(): TState;

  /**
   * Used for initialisation of private variables before any other protected or public methods are called from within the constructor.
   * @param args The arguments passed in to the constructor of this derived class.
   */
  protected init?(...args: any[]): void;

  protected async load?(): Promise<void>;

  protected beforeStateUpdate?(newState: TState, prevState: TState): TState;

  protected afterStateUpdate?(newState: TState, prevState: TState): void;

  protected async setState<TKey extends keyof TState>(state: Partial<TState> | Pick<TState, TKey>): Promise<void> {
    let newState: TState = { ...this._state as any, ...state as any };
    if (Reflect.areShallowEqual(this._state, newState)) { return; }
    const oldState = this._state;
    if (this.beforeStateUpdate) { newState = this.beforeStateUpdate(newState, oldState); }
    this._state = newState;
    if (this.afterStateUpdate) { this.afterStateUpdate(newState, oldState); }
    await this._onChanged.invoke(this, newState, oldState);
  }

  protected recordSubscriptionTo(unsubscribe: Unsubscribe): void {
    this._unsubscriptions.add(unsubscribe);
  }

  //#endregion

}
