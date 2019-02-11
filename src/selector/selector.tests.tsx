import { Store } from '../store';
import { selector } from './selector';
import { mount } from 'enzyme';
import { Component } from 'react';
import { Stores } from '../stores';
import { bind } from 'anux-common';

describe('selector', () => {

  interface IState {
    test1: string;
    test2: string;
  }

  class TestStore extends Store<IState> {

    @bind
    public async updateTest1(test1: string): Promise<void> {
      await this.setState({ test1 });
    }

    protected initialiseState(): IState {
      return {
        test1: '',
        test2: '',
      };
    }

  }

  interface IProps {
    onRender?(): void;
  }

  class TestComponent extends Component<IProps> {

    public render(): React.ReactNode {
      const { onRender, children } = this.props;
      if (onRender) { onRender(); }
      return children || null;
    }

  }

  it('can select from a store and render', async () => {
    let setText: (text: string) => Promise<void>;
    const component = mount((
      <Stores
        configuration={[
          TestStore,
        ]}
      >
        {selector
          .from(TestStore)
          .select(({ state: { test1 }, updateTest1 }) => {
            setText = updateTest1;
            return { test1 };
          })
          .render(({ test1 }) => (
            <TestComponent>{test1}</TestComponent>
          ))
        }
      </Stores>));
    expect(component.text()).to.be.null;
    await setText('test');
    expect(component.text()).to.eq('test');
  });

  it('updates to the store causes re-renders', async () => {
    let setText: (text: string) => Promise<void>;

    let renderCount = 0;
    mount((
      <Stores
        configuration={[
          TestStore,
        ]}
      >
        {selector
          .from(TestStore)
          .select(({ state: { test1 }, updateTest1 }) => {
            setText = updateTest1;
            return { test1 };
          })
          .render(({ test1 }) => (
            <TestComponent onRender={() => { renderCount++; }}>{test1}</TestComponent>
          ))
        }
      </Stores>));
    expect(renderCount).to.eq(1);
    await setText('test');
    expect(renderCount).to.eq(2);
  });

  it('updates to non-selected parts of the store does not cause a re-render', async () => {
    let setText: (text: string) => Promise<void>;

    let renderCount = 0;
    mount((
      <Stores
        configuration={[
          TestStore,
        ]}
      >
        {selector
          .from(TestStore)
          .select(({ state: { test2 }, updateTest1 }) => {
            setText = updateTest1;
            return { test2 };
          })
          .render(({ test2 }) => (
            <TestComponent onRender={() => { renderCount++; }}>{test2}</TestComponent>
          ))
        }
      </Stores>));
    expect(renderCount).to.eq(1);
    await setText('test');
    expect(renderCount).to.eq(1);
  });

  it('does not render if the target cannot be found', async () => {
    expect(() => {
      mount((
        <Stores
          configuration={[]}
        >
          {selector
            .from(TestStore)
            .select(({ state: { test1 } }) => ({ test1 }))
            .render(({ test1 }) => (
              <TestComponent>{test1}</TestComponent>
            ))
          }
        </Stores>));
    }).to.throw('The store required to select from cannot be found within the stores available.');
  });

});
