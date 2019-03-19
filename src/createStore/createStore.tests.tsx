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
            }));

        const component = mount((
            <TestStore.Provider id="boo">
                {TestStore
                    .select(({ filters }) => ({ activeFilters: filters.filter(f => f.isActive) }))
                    .render(({ activeFilters }) => (
                        <div></div>
                    ))}
            </TestStore.Provider>
        ))
    });

});
