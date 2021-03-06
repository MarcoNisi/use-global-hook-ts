import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import createStore from './lib'

const initialState = {
  text: 'ABC',
  anotherText: 'DEF',
  data: 'Useless',
  array: [1, 2, 3],
  obj: { testProp: 'test' }
}

const actions = {
  changeText: (newText: string) => {
    store.setState({ text: newText })
  },
  changeTextAsync: (newText: string) => {
    store.setState({ text: newText }, { defer: true })
  },
  changeAnotherText: (newText: string) => {
    store.setState({ anotherText: newText })
  }
}

const { useGlobal, store, historyActions } = { ...createStore(React, initialState, { debug: false, undoable: true, freezable: true }) }

const TestComponent = (props: { newText: string }) => {
  const [globalState] = useGlobal({
    text: true
  })
  const onClick = () => {
    actions.changeText(props.newText)
  }
  const onAsyncClick = () => {
    actions.changeTextAsync(props.newText)
  }
  return (
    <>
      <span>{globalState.text}</span>
      <button onClick={onClick} id="click">
        Click
      </button>
      <button onClick={historyActions.undo} id="undo">
        Undo
      </button>
      <button onClick={historyActions.redo} id="redo">
        Redo
      </button>
      <button onClick={onAsyncClick} id="async-click">
        Async click
      </button>
    </>
  )
}
const NotUpdatedComponent = (props: { newText: string }) => {
  const [globalState] = useGlobal({
    data: true
  })
  const onClick = () => {
    actions.changeAnotherText(props.newText)
  }
  return (
    <>
      <span>{globalState.anotherText}</span>
      <button onClick={onClick}>Click</button>
    </>
  )
}
let container: any

beforeAll(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterAll(() => {
  document.body.removeChild(container)
  container = null
})

describe('use-global-hook-ts', () => {
  it('should shows the expected text when clicked', () => {
    const component = <TestComponent newText="New text" />
    act(() => {
      ReactDOM.render(component, container)
    })
    const span = document.getElementsByTagName('span')[0]
    const buttonClick = document.getElementById('click')
    expect(span.textContent).toBe('ABC')
    act(() => {
      if (buttonClick) {
        buttonClick.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    })
    expect(span.textContent).toBe('New text')
  })
  it('should undo last action', () => {
    const component = <TestComponent newText="New text" />
    act(() => {
      ReactDOM.render(component, container)
    })
    const buttonUndo = document.getElementById('undo')
    act(() => {
      if (buttonUndo) {
        buttonUndo.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    })
    const span = document.getElementsByTagName('span')[0]
    expect(span.textContent).toBe('ABC')
  })
  it('should redo last action', () => {
    const component = <TestComponent newText="New text" />
    act(() => {
      ReactDOM.render(component, container)
    })
    const buttonRedo = document.getElementById('redo')
    act(() => {
      if (buttonRedo) {
        buttonRedo.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    })
    const span = document.getElementsByTagName('span')[0]
    expect(span.textContent).toBe('New text')
  })
  it('should not update by "anotherText" change', () => {
    const component = <NotUpdatedComponent newText="New text" />
    act(() => {
      ReactDOM.render(component, container)
    })
    const span = container.getElementsByTagName('span')[0]
    const button = container.getElementsByTagName('button')[0]
    expect(span.textContent).toBe('DEF')
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(span.textContent).toBe('DEF')
  })
  it('should throw if mutate state directly', () => {
    expect(store.state.text).toBe('New text')
    expect(() => {
      store.state.array.push(4)
    }).toThrow()
    expect(() => {
      store.state.obj.testProp = 'Very very bad'
    }).toThrow()
    expect(() => {
      store.state.text = 'Very bad'
    }).toThrow()
  })
  it('should make setState async with "{ defer: true }"', () => {
    const component = <TestComponent newText="New async text" />
    act(() => {
      ReactDOM.render(component, container)
    })
    const span = document.getElementsByTagName('span')[0]
    const buttonClick = document.getElementById('asyncClick')
    expect(span.textContent).toBe('New text')
    act(() => {
      if (buttonClick) {
        buttonClick.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    })
    expect(span.textContent).toBe('New text')
  })
  it('should save "lastChanges" correctly', () => {
    act(() => {
      store.setState({ text: 'A new text' })
    })
    expect(store.lastChanges).toEqual({ text: 'A new text' })
  })
})