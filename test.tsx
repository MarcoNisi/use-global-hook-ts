import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import useGlobalHook, { IStore } from './index'

const initialState = {
  text: 'ABC',
  anotherText: 'DEF',
  data: 'Useless'
}

const actions = {
  changeText: (store: IStore, newText: string) => {
    store.setState({ text: newText })
  },
  changeAnotherText: (store: IStore, newText: string) => {
    store.setState({ anotherText: newText })
  }
}

const useGlobal = useGlobalHook(React, initialState, actions)

const TestComponent = (props: { newText: string }) => {
  const [globalState, globalActions] = useGlobal({
    text: true
  })
  const onClick = () => {
    globalActions.changeText(props.newText)
  }
  return <>
    <span>{globalState.text}</span>
    <button onClick={onClick}>Click</button>
  </>
}
const NotUpdatedComponent = (props: { newText: string }) => {
  const [globalState, globalActions] = useGlobal({
    data: true
  })
  const onClick = () => {
    globalActions.changeAnotherText(props.newText)
  }
  return <>
    <span>{globalState.anotherText}</span>
    <button onClick={onClick}>Click</button>
  </>
}
let container: any

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

describe('Button component', () => {
  test('It shows the expected text when clicked', () => {
    const a = <TestComponent newText='New text'/>
    act(() => {
      ReactDOM.render(a, container)
    })
    const span = container.getElementsByTagName('span')[0]
    const button = container.getElementsByTagName('button')[0]
    expect(span.textContent).toBe('ABC')
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(span.textContent).toBe('New text')
  })
  test('It should not update', () => {
    const a = <NotUpdatedComponent newText='New text'/>
    act(() => {
      ReactDOM.render(a, container)
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