// import { StoreListAdapter, ISourceStore, IStoreListItemState } from './listAdapter';
// import { Store } from '../stores';
// import { Upsertable, bind } from 'anux-common';

// interface IFilter {
//   id: string;
//   field: string;
//   value: any;
// }

// interface IStoreState {
//   filters: IFilter[];
// }

// class FiltersStore extends Store<IStoreState> {

//   public filtersListAdapter(): ISourceStore<IFilter> {
//     return {
//       get: () => this.state.filters,
//       set: this.upsert,
//       removeById: this.removeById,
//       hydrate: this.hydrateFilter,
//       store: this,
//     };
//   }

//   @bind
//   public async upsert(filter: Upsertable<IFilter>): Promise<IFilter> {
//     let { filters } = this.state;
//     filters = filters.upsert(filter);
//     await this.setState({ filters });
//     return this.state.filters.findById(filter.id);
//   }

//   @bind
//   public async removeById(id: string): Promise<void> {
//     let { filters } = this.state;
//     filters = filters.removeById(id);
//     await this.setState({ filters });
//   }

//   protected initialiseState(): IStoreState {
//     return {
//       filters: [],
//     };
//   }

//   private hydrateFilter(filter: Upsertable<IFilter>): IFilter {
//     return {
//       id: Math.uniqueId(),
//       field: '',
//       value: undefined,
//       ...filter,
//     };
//   }

// }

// interface IFilterState extends IStoreListItemState {
//   isExpanded: boolean;
//   isActive: boolean;
// }

// class ListOfFilters extends StoreListAdapter<IFilter, IFilterState> {

//   protected createStateForItem(): IFilterState {
//     return {
//       isDirty: false,
//       isActive: false,
//       isExpanded: false,
//     };
//   }

// }

// function setupTest() {
//   const stores = new Stores();
//   const filters = stores.get(FiltersStore);
//   const listOfFilters = new ListOfFilters(filters.filtersListAdapter());
//   const filter: IFilter = { id: Math.uniqueId(), field: 'test', value: 2 };

//   return {
//     filters,
//     listOfFilters,
//     filter,
//     createFilter: (field: string = 'test', value?: any): IFilter => ({ id: Math.uniqueId(), field, value }),
//     dispose: () => {
//       stores.dispose();
//     },
//   };
// }

// describe('listAdapter', () => {

//   describe('upsert', () => {

//     it('can add an item to the store and it gets added to the adapter', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       let items = listOfFilters.state.items;
//       expect(items).to.be.instanceOf(Array).and.to.have.lengthOf(0);
//       await filters.upsert(filter);
//       expect(items).not.to.eql(listOfFilters.state.items);
//       items = listOfFilters.state.items;
//       expect(items).to.be.instanceOf(Array).and.to.have.lengthOf(1);
//       expect(items[0].data).to.eq(filter);
//       expect(items[0]).to.eql({
//         id: filter.id,
//         data: filter,
//         state: {
//           isDirty: false,
//           isActive: false,
//           isExpanded: false,
//         },
//       });

//       dispose();
//     });

//     it('can add an item to the adapter and it gets added to the store', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       expect(filters.state.filters.length).to.eq(0);
//       expect(listOfFilters.state.items.length).to.eq(0);
//       await listOfFilters.upsert({ data: filter });
//       expect(filters.state.filters.length).to.eq(1);
//       const items = listOfFilters.state.items;
//       expect(items).to.be.instanceOf(Array).and.to.have.lengthOf(1);
//       expect(items[0].data).to.eq(filter);
//       expect(items[0]).to.eql({
//         id: filter.id,
//         data: filter,
//         state: {
//           isDirty: false,
//           isActive: false,
//           isExpanded: false,
//         },
//       });

//       dispose();
//     });

//     it('can update the state and data', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       let onChangedCount = 0;
//       listOfFilters.onChanged(() => { onChangedCount++; });
//       expect(onChangedCount).to.eq(1);
//       await filters.upsert(filter);
//       expect(onChangedCount).to.eq(2);
//       await listOfFilters.upsert({ data: { id: filter.id, field: 'blah' }, state: { isExpanded: true } });
//       expect(onChangedCount).to.eq(3);
//       const items = listOfFilters.state.items;
//       expect(items[0]).to.eql({
//         id: filter.id,
//         data: {
//           ...filter,
//           field: 'blah',
//         },
//         state: {
//           isDirty: false,
//           isActive: false,
//           isExpanded: true,
//         },
//       });

//       dispose();
//     });

//     it('can update just the state', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       let onChangedCount = 0;
//       listOfFilters.onChanged(() => { onChangedCount++; });
//       expect(onChangedCount).to.eq(1);
//       await filters.upsert(filter);
//       expect(onChangedCount).to.eq(2);
//       await listOfFilters.upsert({ data: { id: filter.id }, state: { isExpanded: true } });
//       expect(onChangedCount).to.eq(3);
//       const items = listOfFilters.state.items;
//       expect(items[0]).to.eql({
//         id: filter.id,
//         data: filter,
//         state: {
//           isDirty: false,
//           isActive: false,
//           isExpanded: true,
//         },
//       });

//       dispose();
//     });

//     it('can update just the data', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       let onChangedCount = 0;
//       listOfFilters.onChanged(() => { onChangedCount++; });
//       expect(onChangedCount).to.eq(1);
//       await filters.upsert(filter);
//       expect(onChangedCount).to.eq(2);
//       await listOfFilters.upsert({ data: { id: filter.id, field: 'blah' } });
//       expect(onChangedCount).to.eq(3);
//       const items = listOfFilters.state.items;
//       expect(items[0]).to.eql({
//         id: filter.id,
//         data: {
//           ...filter,
//           field: 'blah',
//         },
//         state: {
//           isDirty: false,
//           isActive: false,
//           isExpanded: false,
//         },
//       });

//       dispose();
//     });

//     it('can add a dirty item to the adapter and it does not get added to the store', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       await listOfFilters.upsert({ data: filter, state: { isDirty: true } });
//       expect(filters.state.filters.length).to.eq(0);
//       expect(listOfFilters.state.items.length).to.eq(1);

//       dispose();
//     });

//     it('can add a dirty item to the adapter and adding a new item to the store does not remove the dirty item when it synchronises', async () => {
//       const { filters, listOfFilters, createFilter, dispose, filter } = setupTest();

//       const filter2 = createFilter();
//       await listOfFilters.upsert({ data: filter, state: { isDirty: true } });
//       expect(filters.state.filters.length).to.eq(0);
//       expect(listOfFilters.state.items.length).to.eq(1);
//       await filters.upsert(filter2);
//       expect(filters.state.filters.length).to.eq(1);
//       expect(listOfFilters.state.items.length).to.eq(2);

//       dispose();
//     });

//     it('can update an item in the adapter that is not in the store', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       await listOfFilters.upsert({ data: filter, state: { isDirty: true } });
//       expect(filters.state.filters.length).to.eq(0);
//       expect(listOfFilters.state.items.length).to.eq(1);
//       await listOfFilters.upsert({ data: { ...filter, field: 'blah' } });
//       expect(filters.state.filters.length).to.eq(0);
//       expect(listOfFilters.state.items.length).to.eq(1);

//       dispose();
//     });

//     it('does not make any changes if no changes are made during an upsert', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       let onChangedCount = 0;
//       await filters.upsert(filter);
//       listOfFilters.onChanged(() => { onChangedCount++; });
//       expect(onChangedCount).to.eq(1);
//       const items = filters.state.filters;
//       const listItems = listOfFilters.state.items;
//       await listOfFilters.upsert({ data: { id: filter.id } });
//       expect(onChangedCount).to.eq(1);
//       expect(items).to.eq(filters.state.filters);
//       expect(listItems).to.eq(listOfFilters.state.items);

//       dispose();
//     });

//   });

//   describe('remove', () => {

//     it('can remove an item from the adapter', async () => {
//       const { listOfFilters, dispose, filter } = setupTest();

//       expect(listOfFilters.state.items.length).to.eq(0);
//       const listedFilter = await listOfFilters.upsert({ data: filter });
//       expect(listOfFilters.state.items.length).to.eq(1);
//       await listOfFilters.remove(listedFilter);
//       expect(listOfFilters.state.items.length).to.eq(0);

//       dispose();
//     });

//   });

//   describe('removeById', () => {

//     it('can remove an item from the store and it gets removed from the adapter', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       await filters.upsert(filter);
//       expect(listOfFilters.state.items.length).to.eq(1);
//       await filters.removeById(filter.id);
//       expect(listOfFilters.state.items.length).to.eq(0);

//       dispose();
//     });

//     it('can remove an item from the adapter and it gets removed from the store', async () => {
//       const { filters, listOfFilters, dispose, filter } = setupTest();

//       await filters.upsert(filter);
//       expect(filters.state.filters.length).to.eq(1);
//       expect(listOfFilters.state.items.length).to.eq(1);
//       await listOfFilters.removeById(filter.id);
//       expect(listOfFilters.state.items.length).to.eq(0);
//       expect(filters.state.filters.length).to.eq(0);

//       dispose();
//     });

//   });

// });
