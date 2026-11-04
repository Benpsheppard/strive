// ExerciseSearch.jsx
// Accessible exercise picker (combobox): type to search, filter by muscle group,
// arrow keys to move, Enter to choose. Shows recent exercises when empty.

import { useState, useMemo, useRef, useId } from 'react'
import { FaPlus } from 'react-icons/fa'
import { cx } from '../../utils/cx.js'
import { isSupportedMode } from '../../utils/trackingModes.js'

const MAX_RESULTS = 30

// Exercises the user logged most recently, newest first
const getRecentExercises = (workouts, allExercises, limit = 6) => {
    const byId = new Map(allExercises.map(ex => [String(ex._id), ex]))
    const recent = []
    const seen = new Set()

    const newestFirst = [...workouts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    for (const workout of newestFirst) {
        for (const ex of workout.exercises || []) {
            const id = String(ex.exercise?._id ?? ex.exercise ?? '')
            if (!id || seen.has(id) || !byId.has(id)) continue
            seen.add(id)
            recent.push(byId.get(id))
            if (recent.length >= limit) return recent
        }
    }
    return recent
}

const ExerciseSearch = ({ allExercises, workouts, onSelect, onCreate }) => {
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)
    const [group, setGroup] = useState('All')
    const [activeIndex, setActiveIndex] = useState(0)
    const listId = useId()
    const inputRef = useRef(null)

    const groups = useMemo(
        () => ['All', ...new Set(allExercises.map(ex => ex.muscleGroup).filter(Boolean))],
        [allExercises]
    )

    const recent = useMemo(() => getRecentExercises(workouts, allExercises), [workouts, allExercises])

    const results = useMemo(() => {
        const text = query.trim().toLowerCase()

        if (!text && group === 'All') return recent

        return allExercises
            .filter(ex => (group === 'All' || ex.muscleGroup === group) && ex.name.toLowerCase().includes(text))
            .sort((a, b) => {
                // Names that start with the search come first
                const aStarts = a.name.toLowerCase().startsWith(text) ? 0 : 1
                const bStarts = b.name.toLowerCase().startsWith(text) ? 0 : 1
                return aStarts - bStarts || a.name.localeCompare(b.name)
            })
            .slice(0, MAX_RESULTS)
    }, [query, group, allExercises, recent])

    const showingRecent = !query.trim() && group === 'All'
    const hasQuery = query.trim().length > 0

    const choose = (exercise) => {
        setQuery('')
        setOpen(false)
        setGroup('All')
        onSelect(exercise)
    }

    const onKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            setActiveIndex(i => Math.min(i + 1, results.length - 1))
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex(i => Math.max(i - 1, 0))
        } else if (event.key === 'Enter' && open && results[activeIndex]) {
            event.preventDefault()
            choose(results[activeIndex])
        } else if (event.key === 'Escape') {
            setOpen(false)
        }
    }

    const listVisible = open && (results.length > 0 || hasQuery)
    const activeId = listVisible && results[activeIndex] ? `${listId}-${activeIndex}` : undefined

    return (
        <div className="relative space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by muscle group">
                {groups.map(name => (
                    <button
                        key={name}
                        type="button"
                        aria-pressed={group === name}
                        onClick={() => { setGroup(name); setActiveIndex(0); setOpen(true); inputRef.current?.focus() }}
                        className={cx(
                            'shrink-0 rounded-full border px-3 py-1 text-sm transition-colors',
                            group === name
                                ? 'border-accent bg-accent text-white'
                                : 'border-line bg-bg text-muted hover:text-fg'
                        )}
                    >
                        {name}
                    </button>
                ))}
            </div>

            <label htmlFor={`${listId}-input`} className="sr-only">Search exercises</label>
            <input
                ref={inputRef}
                id={`${listId}-input`}
                type="text"
                role="combobox"
                aria-expanded={listVisible}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={activeId}
                autoComplete="off"
                value={query}
                placeholder="Search for an exercise"
                onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); setOpen(true) }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onKeyDown={onKeyDown}
                className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-fg placeholder:text-muted focus:border-accent-fg focus:outline-none focus:ring-2 focus:ring-accent-fg/40"
            />

            {listVisible && (
                <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-xl border border-line bg-surface-2 shadow-card">
                    <div className="max-h-72 overflow-y-auto">
                        {showingRecent && results.length > 0 && (
                            <p className="px-4 pb-1 pt-2 text-xs uppercase tracking-wide text-muted">Recent</p>
                        )}

                        {results.length === 0 && hasQuery && (
                            <p className="px-4 py-3 text-sm text-muted">No exercises match “{query.trim()}”.</p>
                        )}

                        <ul id={listId} role="listbox" aria-label="Exercises">
                            {results.map((exercise, index) => {
                                const supported = isSupportedMode(exercise.trackingMode)
                                return (
                                    <li
                                        key={exercise._id}
                                        id={`${listId}-${index}`}
                                        role="option"
                                        aria-selected={index === activeIndex}
                                        aria-disabled={!supported}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => supported && choose(exercise)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={cx(
                                            'px-4 py-2.5',
                                            supported ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                                            index === activeIndex && 'bg-bg/70'
                                        )}
                                    >
                                        <div className="font-semibold text-fg">
                                            {exercise.name}
                                            {exercise.isCustom && <span className="ml-2 rounded bg-bg px-1.5 py-0.5 text-xs font-normal text-muted">Custom</span>}
                                        </div>
                                        <div className="text-xs text-muted">
                                            {exercise.muscleGroup}{exercise.subMuscleGroup && exercise.subMuscleGroup !== 'Other' ? ` · ${exercise.subMuscleGroup}` : ''}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    {onCreate && (
                        <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => { setOpen(false); onCreate(query.trim()) }}
                            className="flex w-full items-center gap-2 border-t border-line px-4 py-3 text-left text-accent-fg hover:bg-bg/70"
                        >
                            <FaPlus aria-hidden="true" /> Create custom exercise{hasQuery ? ` “${query.trim()}”` : ''}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default ExerciseSearch
