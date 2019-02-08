// import { Store, Stores } from '../stores';
// import { augmentOf } from './augmentOf';

// describe.skip('augmentOf', () => {

//   interface IPencil {
//     id: string;
//     length: number;
//     color: string;
//   }

//   interface IPencilState {
//     pencils: IPencil[];
//   }

//   class Pencils extends Store<IPencilState> {

//     public addPencil(pencil: IPencil): void {
//       let { pencils } = this.state;
//       pencils = pencils.upsert(pencil);
//       this.setState({ pencils });
//     }

//     public overridableAddPencil(_pencil: IPencil): void {
//       throw new Error('This should not be executed.');
//     }

//     protected initialiseState(): IPencilState {
//       return {
//         pencils: [],
//       };
//     }

//   }

//   interface IAugmentedPencilsState {
//     something: string;
//   }

//   class AugmentedPencils extends augmentOf<typeof Pencils, IAugmentedPencilsState>(Pencils) {

//     public overridableAddPencil(pencil: IPencil): void {
//       this.addPencil(pencil);
//     }

//     public async updateSomething(something: string): Promise<void> {
//       await this.setAugmentState({ something });
//     }

//     protected initialiseAugmentState(): IAugmentedPencilsState {
//       return {
//         something: '',
//       };
//     }

//   }

//   it('can augment a class and the state is the state of the class instance passed into it', () => {
//     const stores = new Stores();
//     const pencils = stores.get(Pencils);
//     pencils.addPencil({ id: Math.uniqueId(), color: 'red', length: 5 });
//     const augmentedPencils = stores.get(AugmentedPencils, { args: [pencils] });
//     expect(augmentedPencils.state.pencils).to.be.instanceOf(Array).and.have.lengthOf(1);
//   });

//   it('can augment a class and the derived methods are actually proxied through to the instance passed into it', () => {
//     const stores = new Stores();
//     const pencils = stores.get(Pencils);
//     const augmentedPencils = stores.get(AugmentedPencils, { args: [pencils] });
//     augmentedPencils.addPencil({ id: Math.uniqueId(), color: 'red', length: 5 });
//     expect(pencils.state.pencils).to.be.instanceOf(Array).and.have.lengthOf(1);
//   });

//   it('can augment a class and the overridden methods are not proxied through to the instance passed into it', () => {
//     const stores = new Stores();
//     const pencils = stores.get(Pencils);
//     const augmentedPencils = stores.get(AugmentedPencils, { args: [pencils] });
//     augmentedPencils.overridableAddPencil({ id: Math.uniqueId(), color: 'red', length: 5 });
//     expect(pencils.state.pencils).to.be.instanceOf(Array).and.have.lengthOf(1);
//   });

//   it('can access the underlying store state', () => {
//     const stores = new Stores();
//     const pencils = stores.get(Pencils);
//     const augmentedPencils = stores.get(AugmentedPencils, { args: [pencils] });

//     pencils.addPencil({ id: Math.uniqueId(), color: 'red', length: 5 });
//     expect(augmentedPencils.state.pencils).to.be.instanceOf(Array).and.have.lengthOf(1);
//   });

//   it('can access the augment store state', () => {
//     const stores = new Stores();
//     const pencils = stores.get(Pencils);
//     const augmentedPencils = stores.get(AugmentedPencils, { args: [pencils] });
//     expect(augmentedPencils.augmentState.something).to.be.eq('');
//     augmentedPencils.updateSomething('test');
//     expect(augmentedPencils.augmentState.something).to.be.eq('test');
//   });

//   it('underlying store state change raises onChanged event', () => {
//     const stores = new Stores();
//     const pencils = stores.get(Pencils);
//     const augmentedPencils = stores.get(AugmentedPencils, { args: [pencils] });
//     let callsToOnChanged = 0;
//     augmentedPencils.onChanged(() => { callsToOnChanged++; }, { immediatelyInvoke: false });
//     expect(callsToOnChanged).to.be.eq(0);
//     pencils.addPencil({ id: Math.uniqueId(), color: 'red', length: 5 });
//     expect(callsToOnChanged).to.be.eq(1);
//   });

//   it('augment store state change raises onAugmentChanged event', () => {
//     const stores = new Stores();
//     const pencils = stores.get(Pencils);
//     const augmentedPencils = stores.get(AugmentedPencils, { args: [pencils] });
//     let callsToOnChanged = 0;
//     augmentedPencils.onAugmentChanged(() => { callsToOnChanged++; }, { immediatelyInvoke: false });
//     expect(augmentedPencils.augmentState.something).to.be.eq('');
//     expect(callsToOnChanged).to.be.eq(0);
//     augmentedPencils.updateSomething('test');
//     expect(callsToOnChanged).to.be.eq(1);
//   });

// });
