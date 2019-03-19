interface IStoreContext<TState extends {} = {}, TActions extends {} = {}> {
  state: TState;
  actions: TActions;
}

export const StoreContext = React.createContext<IStoreContext>({
  state: undefined,
  actions: undefined,
});

