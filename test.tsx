import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import useGlobalHook, { IStore } from './index'

const initialState = {
  text: 'ABC'
}

const actions = {
  changeText: (store: IStore, newText: string) => {
    store.setState({ text: newText })
  }
}

const useGlobal = useGlobalHook(React, initialState, actions)

const TestComponent = (props: { newText: string }) => {
  const [globalState, globalActions] = useGlobal()
  const onClick = () => {
    globalActions.changeText(props.newText)
  }
  return <>
    <span>{globalState.text}</span>
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
  test('it shows the expected text when clicked', () => {
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
})