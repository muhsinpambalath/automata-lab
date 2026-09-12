import { useState } from 'react'
import type { State } from './State'
import './Canvas.css'

import selectIcon from '../../../assets/lab-icons/select.svg'
import addStateIcon from '../../../assets/lab-icons/add_state.svg'
import connectIcon from '../../../assets/lab-icons/connect.svg'
import startIcon from '../../../assets/lab-icons/set_start.svg'
import acceptIcon from '../../../assets/lab-icons/set_accept.svg'
import deleteIcon from '../../../assets/lab-icons/delete.svg'

function Canvas() {

    const MIN_STATE_DISTANCE = 70
    const [selectedState, setSelectedState] = useState<string | null>(null)
    const [activeTool, setActiveTool] = useState('select')
    const [states, setStates] = useState<State[]>([])
    const [draggingState, setDraggingState] = useState<string | null>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [editingState, setEditingState] = useState<string | null>(null)

    const addState = (x: number, y: number) => {
        const tooClose = states.some((state) => {
            const distance = Math.hypot(
                state.x - x,
                state.y - y
            )

            return distance < MIN_STATE_DISTANCE
        })

        if (tooClose) return

        const newState: State = {
            id: crypto.randomUUID(),
            label: `q${states.length}`,
            x,
            y,
            isStart: states.length === 0,
            isAccept: false,
        }

        setStates([...states, newState])
    }

    const selectState = (stateId: string) => {
        if (activeTool !== 'select') return

        setSelectedState(stateId)
    }

    const renameState = (stateId: string, newLabel: string) => {
        const label = newLabel.trim()

        if (!label) return

        setStates((currentStates) =>
            currentStates.map((state) =>
                state.id === stateId
                    ? { ...state, label }
                    : state
            )
        )

        setEditingState(null)
    }

    return (
        <div className="canvas">
            <div className="canvas-toolbar">

                <button
                    className={`tool-button ${activeTool === 'select' ? 'active' : ''}`}
                    onClick={() => setActiveTool('select')}
                    data-tooltip="Select"
                >
                    <img src={selectIcon} alt="" />
                </button>

                <button
                    className={`tool-button ${activeTool === 'add' ? 'active' : ''}`}
                    onClick={() => setActiveTool('add')}
                    data-tooltip="Add State"
                >
                    <img src={addStateIcon} alt="" />
                </button>
                
                <button
                    className={`tool-button ${activeTool === 'connect' ? 'active' : ''}`}
                    onClick={() => setActiveTool('connect')}
                    data-tooltip="Connect"
                >
                    <img src={connectIcon} alt="" />
                </button>

                <button
                    className={`tool-button ${activeTool === 'start' ? 'active' : ''}`}
                    onClick={() => setActiveTool('start')}
                    data-tooltip="Start State"
                >
                    <img src={startIcon} alt="" />
                </button>

                <button
                    className={`tool-button ${activeTool === 'accept' ? 'active' : ''}`}
                    onClick={() => setActiveTool('accept')}
                    data-tooltip="Accept State"
                >
                    <img src={acceptIcon} alt="" />
                </button>

                <button
                    className={`tool-button ${activeTool === 'delete' ? 'active' : ''}`}
                    onClick={() => setActiveTool('delete')}
                    data-tooltip="Delete"
                >
                    <img src={deleteIcon} alt="" />
                </button>

            </div>

            <div
                className={`canvas-area tool-${activeTool}`}
                onClick={(event) => {
                    if (activeTool !== 'add') return

                    const rect = event.currentTarget.getBoundingClientRect()

                    const x = event.clientX - rect.left
                    const y = event.clientY - rect.top

                    addState(x, y)
                }}
            >
                {states.length === 0 && (
                    <p>Build your automaton here.</p>
                )}

                {states.map((state) => (
                    <div
                        key={state.id}
                        className={`state-node ${
                            selectedState === state.id ? 'selected' : ''
                        }`}
                        style={{
                            left: state.x,
                            top: state.y,
                        }}
                        onClick={(event) => {
                            event.stopPropagation()
                            selectState(state.id)
                        }}
                        onContextMenu={(event) => {
                            event.preventDefault()
                            event.stopPropagation()

                            if (activeTool === 'select') {
                                setEditingState(state.id)
                            }
                        }}
                        onPointerDown={(event) => {
                            if (activeTool !== 'select') return

                            event.stopPropagation()

                            const rect = event.currentTarget.getBoundingClientRect()

                            setSelectedState(state.id)
                            setDraggingState(state.id)

                            setDragOffset({
                                x: event.clientX - rect.left - rect.width / 2,
                                y: event.clientY - rect.top - rect.height / 2,
                            })

                            event.currentTarget.setPointerCapture(event.pointerId)
                        }}
                        onPointerMove={(event) => {
                            if (draggingState !== state.id) return

                            const canvas = event.currentTarget.parentElement!
                            const rect = canvas.getBoundingClientRect()

                            const rawX =
                                event.clientX -
                                rect.left -
                                dragOffset.x

                            const rawY =
                                event.clientY -
                                rect.top -
                                dragOffset.y

                            const x = Math.max(
                                30,
                                Math.min(rawX, rect.width - 30)
                            )

                            const y = Math.max(
                                30,
                                Math.min(rawY, rect.height - 30)
                            )

                            const adjustedPosition = { x, y }

                            states.forEach((otherState) => {
                                if (otherState.id === state.id) return

                                const dx = x - otherState.x
                                const dy = y - otherState.y
                                const distance = Math.hypot(dx, dy)

                                if (distance < MIN_STATE_DISTANCE) {
                                    const angle = Math.atan2(dy, dx)

                                    adjustedPosition.x =
                                        otherState.x + Math.cos(angle) * MIN_STATE_DISTANCE

                                    adjustedPosition.y =
                                        otherState.y + Math.sin(angle) * MIN_STATE_DISTANCE
                                }
                            })

                            setStates((currentStates) =>
                                currentStates.map((currentState) =>
                                    currentState.id === state.id
                                        ? {
                                            ...currentState,
                                            x: adjustedPosition.x,
                                            y: adjustedPosition.y,
                                        }
                                        : currentState
                                )
                            )
                        }}
                        onPointerUp={(event) => {
                            event.currentTarget.releasePointerCapture(event.pointerId)
                            setDraggingState(null)
                        }}
                    >
                        {editingState === state.id ? (
                            <input
                                autoFocus
                                defaultValue={state.label}
                                className="state-name-input"
                                onClick={(event) => event.stopPropagation()}
                                onPointerDown={(event) => event.stopPropagation()}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        renameState(
                                            state.id,
                                            event.currentTarget.value
                                        )
                                    }

                                    if (event.key === 'Escape') {
                                        setEditingState(null)
                                    }
                                }}
                                onBlur={(event) => {
                                    renameState(
                                        state.id,
                                        event.currentTarget.value
                                    )
                                }}
                            />
                        ) : (
                            state.label
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Canvas