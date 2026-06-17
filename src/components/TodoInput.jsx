import { useState } from 'react'

export default function TodoInput({ onAdd }) {
  const [text, setText] = useState('')

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      const trimmed = text.trim()
      if (trimmed) {
        onAdd(trimmed)
        setText('')
      }
    }
  }

  return (
    <input
      className="todo-input"
      type="text"
      placeholder="What needs to be done?"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  )
}
