import { createStore } from "./createStore";
import { mount } from 'enzyme';

interface ITestStoreProps {
    id: string;
}

interface ITestItem {
    id: string;
    name: string;
    isActive: boolean;
}

interface ITestStoreState {
    filters: ITestItem[];
}

describe('createStore', () => {

    it('can create a store', () => {
        const TestStore = createStore
            .props<ITestStoreProps>(props => ({
                id: undefined,
                ...props,
            }))
            .state<ITestStoreState>({
                filters: [],
            })
            .actions((setState, { id }) => ({
                upsert() {

                },
            }))
            .selectors({
                activeFilters: (({ filters }) => ({ activeFilters: filters.filter(f => f.isActive) })),
            });

        const component = mount((
            <TestStore.Provider id="boo">
                {TestStore.Select(({ }) => ({}))
                    {({}, {}) => (
                        <div></div>
                )}
                </TestStore.Consumer>
            </TestStore.Provider >
        ))
    });

});
