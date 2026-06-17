import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

const mockStorage = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value)
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true })

describe('Todo App', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('renders the title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'TODO' })).toBeInTheDocument()
  })

  it('renders the input field', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument()
  })

  it('adds a todo when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Buy groceries{Enter}')
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  it('clears the input after adding a todo', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Buy groceries{Enter}')
    expect(input).toHaveValue('')
  })

  it('does not add an empty todo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), '   {Enter}')
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('toggles a todo as completed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Test task{Enter}')
    const checkbox = screen.getByRole('checkbox', { name: 'Toggle: Test task' })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('untoggle a completed todo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Test task{Enter}')
    const checkbox = screen.getByRole('checkbox', { name: 'Toggle: Test task' })
    await user.click(checkbox)
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('deletes a todo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Delete me{Enter}')
    const list = screen.getByRole('list', { name: 'Todo list' })
    const item = within(list).getByText('Delete me').closest('li')
    await user.click(within(item).getByRole('button', { name: 'Delete: Delete me' }))
    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
  })

  it('shows the item count', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Task 1{Enter}')
    await user.type(input, 'Task 2{Enter}')
    expect(screen.getByText('2 items left')).toBeInTheDocument()
  })

  it('updates count after completing a todo', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Task 1{Enter}')
    await user.type(input, 'Task 2{Enter}')
    await user.click(screen.getByRole('checkbox', { name: 'Toggle: Task 1' }))
    expect(screen.getByText('1 item left')).toBeInTheDocument()
  })

  describe('Filtering', () => {
    async function setupMixedTodos(user) {
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Active task{Enter}')
      await user.type(input, 'Completed task{Enter}')
      await user.click(screen.getByRole('checkbox', { name: 'Toggle: Completed task' }))
    }

    it('filters to active todos', async () => {
      const user = userEvent.setup()
      render(<App />)
      await setupMixedTodos(user)
      await user.click(screen.getByRole('button', { name: 'Active' }))
      expect(screen.getByText('Active task')).toBeInTheDocument()
      expect(screen.queryByText('Completed task')).not.toBeInTheDocument()
    })

    it('filters to completed todos', async () => {
      const user = userEvent.setup()
      render(<App />)
      await setupMixedTodos(user)
      await user.click(screen.getByRole('button', { name: 'Completed' }))
      expect(screen.queryByText('Active task')).not.toBeInTheDocument()
      expect(screen.getByText('Completed task')).toBeInTheDocument()
    })

    it('shows all todos when All is selected', async () => {
      const user = userEvent.setup()
      render(<App />)
      await setupMixedTodos(user)
      await user.click(screen.getByRole('button', { name: 'Completed' }))
      await user.click(screen.getByRole('button', { name: 'All' }))
      expect(screen.getByText('Active task')).toBeInTheDocument()
      expect(screen.getByText('Completed task')).toBeInTheDocument()
    })
  })

  it('clears completed todos', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Keep me{Enter}')
    await user.type(input, 'Delete me{Enter}')
    await user.click(screen.getByRole('checkbox', { name: 'Toggle: Delete me' }))
    await user.click(screen.getByRole('button', { name: 'Clear completed' }))
    expect(screen.getByText('Keep me')).toBeInTheDocument()
    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
  })

  it('edits a todo on double-click', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Original text{Enter}')
    await user.dblClick(screen.getByText('Original text'))
    const editInput = screen.getByRole('textbox', { name: 'Edit todo' })
    await user.clear(editInput)
    await user.type(editInput, 'Updated text{Enter}')
    expect(screen.getByText('Updated text')).toBeInTheDocument()
    expect(screen.queryByText('Original text')).not.toBeInTheDocument()
  })

  it('cancels edit on Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Original text{Enter}')
    await user.dblClick(screen.getByText('Original text'))
    const editInput = screen.getByRole('textbox', { name: 'Edit todo' })
    await user.clear(editInput)
    await user.type(editInput, 'Changed{Escape}')
    expect(screen.getByText('Original text')).toBeInTheDocument()
  })

  it('toggles all todos with the toggle-all button', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByPlaceholderText('What needs to be done?')
    await user.type(input, 'Task 1{Enter}')
    await user.type(input, 'Task 2{Enter}')
    await user.click(screen.getByRole('button', { name: 'Toggle all todos' }))
    expect(screen.getByRole('checkbox', { name: 'Toggle: Task 1' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Toggle: Task 2' })).toBeChecked()
  })
})
