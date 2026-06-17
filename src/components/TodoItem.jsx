import { useState, useRef, useEffect } from 'react'

export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function startEdit() {
    setEditing(true)
    setEditText(todo.text)
  }

  function commitEdit() {
    const trimmed = editText.trim()
    if (trimmed) {
      onEdit(todo.id, trimmed)
      setEditing(false)
    } else {
      onDelete(todo.id)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') {
      setEditText(todo.text)
      setEditing(false)
    }
  }

  return (
    <li className={`todo-item${todo.completed ? ' completed' : ''}${editing ? ' editing' : ''}`}>
      {editing ? (
        <input
          ref={inputRef}
          className="edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          aria-label="Edit todo"
        />
      ) : (
        <>
          <input
            type="checkbox"
            className="toggle"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            aria-label={`Toggle: ${todo.text}`}
          />
          <label onDoubleClick={startEdit}>{todo.text}</label>
          <button
            className="destroy"
            onClick={() => onDelete(todo.id)}
            aria-label={`Delete: ${todo.text}`}
          >
            ×
          </button>
        </>
      )}
    </li>
  )
}
