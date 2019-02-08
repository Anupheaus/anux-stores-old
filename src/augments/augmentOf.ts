// import { ConstructorOf, ArgumentInvalidError } from 'anux-common';
// import { Store } from '../stores';

// const ignoredDefinitions = ['constructor', 'initialiseState', 'setState'];
// const includedDefinitions = ['state'];

// export function augmentOf<TStoreType extends ConstructorOf<Store>, TState extends {} = {}>(storeType: TStoreType) {
//   type TStoreState = InstanceType<TStoreType>['state'];
//   abstract class AugmentedStore extends storeType {
//     constructor(...args: any[]) {
//       super(...args);
//       if (args.length < 1) { throw new ArgumentInvalidError('store'); }
//     }

//     //#region Variables

//     private _store: InstanceType<TStoreType>;

//     //#endregion

//     //#region Properties

//     public get state() { return this._store.state; }

//     public get augmentState() { return super.state as TState; }

//     public get onChanged() { return this._store.onChanged; }

//     public get onAugmentChanged() { return super.onChanged; }

//     protected get store() { return this._store; }

//     //#endregion

//     //#region  Methods

//     protected init(store: InstanceType<TStoreType>): void {
//       this._store = store;
//       this.bindStoreDefinitionsToStore();
//     }

//     protected initialiseState(): TStoreState {
//       return this.initialiseAugmentState();
//     }

//     protected abstract initialiseAugmentState(): TState;

//     protected setState<TKey extends keyof TStoreState>(state: Partial<TStoreState> | Pick<TStoreState, TKey>): Promise<void> {
//       return this._store['setState'](state);
//     }

//     protected setAugmentState<TKey extends keyof TState>(state: Partial<TState> | Pick<TState, TKey>): Promise<void> {
//       return super.setState(state);
//     }

//     private bindStoreDefinitionsToStore(): void {
//       const storePrototype = this._store.constructor.prototype;
//       const thisPrototype = this.constructor.prototype;
//       const storeDefinitions = Object.getOwnPropertyNames(storePrototype);
//       const ownDefinitions = Object.getOwnPropertyNames(thisPrototype);
//       const definitionsToBind = storeDefinitions.except(ownDefinitions.concat(ignoredDefinitions)).concat(includedDefinitions).distinct();
//       definitionsToBind.forEach(key => this.bindStoreDefinitionToStore(key, Reflect.getDefinition(storePrototype, key)));
//     }

//     private bindStoreDefinitionToStore(key: string, definition: PropertyDescriptor) {
//       if (definition.get) { definition.get = definition.get.bind(this._store); }
//       if (definition.set) { definition.set = definition.set.bind(this._store); }
//       if (definition.value) { definition.value = definition.value.bind(this._store); }
//       Object.defineProperty(this, key, definition);
//     }

//     //#endregion

//   }
//   return AugmentedStore as any as ConstructorOf<AugmentedStore & InstanceType<TStoreType>>;
// }

// // export function augmentOf<TStore extends Store, TStoreType extends ConstructorOf<TStore>>(store: TStore) {
// //   const BaseType = store['constructor'] as TStoreType;
// //   // @ts-ignore
// //   class AugmentedStore extends BaseType {

// //     //#region Properties

// //     protected get stores() { return store['_stores']; }
// //     protected get setState() { return store['setState']; }
// //     protected get load() { return store['load']; }
// //     protected get initialiseState() { return store['initialiseState']; }

// //     //#endregion

// //     //#region  Methods

// //     //#endregion

// //   }
// //   return new AugmentedStore();
// // }

// // interface IState {

// // }

// // // tslint:disable-next-line:max-classes-per-file
// // class A extends Store<IState> {
// //   constructor(num: number)   {
// //     super();
// //   }

// //   public onA(): string {
// //     return '';
// //   }

// //   protected initialiseState(): IState {
// //     return {};
// //   }

// // }
// // const a = new A(3);

// // const b = augmentOf2(a);
