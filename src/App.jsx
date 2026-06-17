import { useReducer, useEffect, useMemo } from 'react'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'
import TodoFilter from './components/TodoFilter'
import './App.css'

const STORAGE_KEY = 'todo-app-state'

const initialState = { todos: [], filter: 'all' }

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.state
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: crypto.randomUUID(), text: action.text, completed: false, createdAt: Date.now() },
        ],
      }
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) => (t.id === action.id ? { ...t, completed: !t.completed } : t)),
      }
    case 'TOGGLE_ALL': {
      const allCompleted = state.todos.every((t) => t.completed)
      return {
        ...state,
        todos: state.todos.map((t) => ({ ...t, completed: !allCompleted })),
      }
    }
    case 'DELETE_TODO':
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) }
    case 'EDIT_TODO':
      return {
        ...state,
        todos: state.todos.map((t) => (t.id === action.id ? { ...t, text: action.text } : t)),
      }
    case 'CLEAR_COMPLETED':
      return { ...state, todos: state.todos.filter((t) => !t.completed) }
    case 'SET_FILTER':
      return { ...state, filter: action.filter }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { todos, filter } = state

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) dispatch({ type: 'LOAD', state: JSON.parse(saved) })
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed)
    if (filter === 'completed') return todos.filter((t) => t.completed)
    return todos
  }, [todos, filter])

  const activeCount = useMemo(() => todos.filter((t) => !t.completed).length, [todos])
  const hasCompleted = todos.some((t) => t.completed)
  const allCompleted = todos.length > 0 && todos.every((t) => t.completed)

  return (
    <div className="app">
      <h1>TODO</h1>
      <div className="todo-card">
        <div className="input-row">
          {todos.length > 0 && (
            <button
              className={`toggle-all${allCompleted ? ' active' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_ALL' })}
              aria-label="Toggle all todos"
            >
              ❯
            </button>
          )}
          <TodoInput onAdd={(text) => dispatch({ type: 'ADD_TODO', text })} />
        </div>
        <TodoList
          todos={filteredTodos}
          onToggle={(id) => dispatch({ type: 'TOGGLE_TODO', id })}
          onDelete={(id) => dispatch({ type: 'DELETE_TODO', id })}
          onEdit={(id, text) => dispatch({ type: 'EDIT_TODO', id, text })}
        />
        {todos.length > 0 && (
          <footer className="footer">
            <span className="count">
              {activeCount} item{activeCount !== 1 ? 's' : ''} left
            </span>
            <TodoFilter
              filter={filter}
              onFilter={(f) => dispatch({ type: 'SET_FILTER', filter: f })}
            />
            {hasCompleted ? (
              <button className="clear-btn" onClick={() => dispatch({ type: 'CLEAR_COMPLETED' })}>
                Clear completed
              </button>
            ) : (
              <span className="clear-placeholder" />
            )}
          </footer>
        )}
      </div>
    </div>
  )
}
