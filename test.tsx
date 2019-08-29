import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import useGlobalHook from './lib'
import { IStore } from './interfaces'


interface IAppState {
  text: string,
  anotherText: string,
  data: string
}

const initialState = {
  text: 'ABC',
  anotherText: 'DEF',
  data: 'Useless'
}

const actions = {
  changeText: (store: IStore<IAppState>, newText: string) => {
    store.setState({ text: newText })
  },
  changeAnotherText: (store: IStore<IAppState>, newText: string) => {
    store.setState({ anotherText: newText })
  }
}

const useGlobal = useGlobalHook(React, initialState, actions, { debug: false, undoable: true })

const TestComponent = (props: { newText: string }) => {
  const [globalState, globalActions] = useGlobal({
    text: true
  })
  const onClick = () => {
    globalActions.changeText(props.newText)
  }
  return (
    <>
      <span>{globalState.text}</span>
      <button onClick={onClick} id="click">Click</button>
      <button onClick={globalActions.undo} id="undo">Undo</button>
      <button onClick={globalActions.redo} id="redo">Redo</button>
    </>
  )
}
const NotUpdatedComponent = (props: { newText: string }) => {
  const [globalState, globalActions] = useGlobal({
    data: true
  })
  const onClick = () => {
    globalActions.changeAnotherText(props.newText)
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

describe('Test use-global-hook-ts', () => {
  test('It shows the expected text when clicked', () => {
    const component = <TestComponent newText='New text' />
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
  test('It should undo last action', () => {
    const component = <TestComponent newText='New text' />
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
  test('It should redo last action', () => {
    const component = <TestComponent newText='New text' />
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
  test('It should not update by "anotherText" change', () => {
    const component = <NotUpdatedComponent newText='New text' />
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
})
