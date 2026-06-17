const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export default function TodoFilter({ filter, onFilter }) {
  return (
    <nav className="filter" aria-label="Filter todos">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          className={`filter-btn${filter === value ? ' active' : ''}`}
          onClick={() => onFilter(value)}
          aria-pressed={filter === value}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
