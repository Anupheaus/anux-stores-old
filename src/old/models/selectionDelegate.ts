export type SelectionDelegate<TTarget extends object, TSelection extends {}> = (self: TTarget) => TSelection;
