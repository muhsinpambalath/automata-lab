import { useState } from 'react'
import type {
    State,
    Transition,
    AutomatonType,
} from '../../../models/automaton'
import './Canvas.css'

import selectIcon from '../../../assets/lab-icons/select.svg'
import addStateIcon from '../../../assets/lab-icons/add_state.svg'
import connectIcon from '../../../assets/lab-icons/connect.svg'
import startIcon from '../../../assets/lab-icons/set_start.svg'
import acceptIcon from '../../../assets/lab-icons/set_accept.svg'
import deleteIcon from '../../../assets/lab-icons/delete.svg'

type CanvasProps = {
    automatonType: AutomatonType
}

type Point = {
    x: number
    y: number
}

const STATE_RADIUS = 30
const PATH_CLEARANCE = 18

const distanceBetween = (a: Point, b: Point) =>
    Math.hypot(a.x - b.x, a.y - b.y)

const pointToSegmentDistance = (
    point: Point,
    start: Point,
    end: Point,
) => {
    const dx = end.x - start.x
    const dy = end.y - start.y

    if (dx === 0 && dy === 0) {
        return distanceBetween(point, start)
    }

    const t = Math.max(
        0,
        Math.min(
            1,
            (
                (point.x - start.x) * dx +
                (point.y - start.y) * dy
            ) / (dx * dx + dy * dy)
        )
    )

    return distanceBetween(point, {
        x: start.x + t * dx,
        y: start.y + t * dy,
    })
}

const sampleQuadratic = (
    start: Point,
    control: Point,
    end: Point,
) => {
    const points: Point[] = []

    for (let i = 0; i <= 20; i++) {
        const t = i / 20
        const oneMinusT = 1 - t

        points.push({
            x:
                oneMinusT * oneMinusT * start.x +
                2 * oneMinusT * t * control.x +
                t * t * end.x,

            y:
                oneMinusT * oneMinusT * start.y +
                2 * oneMinusT * t * control.y +
                t * t * end.y,
        })
    }

    return points
}

const pathHitsState = (
    points: Point[],
    states: State[],
    fromId: string,
    toId: string,
) => {
    return points.some((point) =>
        states.some((state) => {
            if (
                state.id === fromId ||
                state.id === toId
            ) {
                return false
            }

            return (
                distanceBetween(point, {
                    x: state.x,
                    y: state.y,
                }) <
                STATE_RADIUS + PATH_CLEARANCE
            )
        })
    )
}


function Canvas({ automatonType }: CanvasProps) {

    const MIN_STATE_DISTANCE = 70
    const [selectedState, setSelectedState] = useState<string | null>(null)
    const [activeTool, setActiveTool] = useState('select')
    const [states, setStates] = useState<State[]>([])
    const [draggingState, setDraggingState] = useState<string | null>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [editingState, setEditingState] = useState<string | null>(null)
    const [transitions, setTransitions] = useState<Transition[]>([])
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
    const [connectionTarget, setConnectionTarget] = useState<string | null>(null)
    const [transitionSymbols, setTransitionSymbols] = useState('')
    const [transitionError, setTransitionError] = useState('')


    const transitionRoutes = new Map<
        string,
        {
            start: Point
            end: Point
            control: Point | null
        }
    >()

    transitions.forEach((transition, transitionIndex) => {
        const fromState = states.find(
            (state) => state.id === transition.from
        )

        const toState = states.find(
            (state) => state.id === transition.to
        )

        if (!fromState || !toState) return

        if (fromState.id === toState.id) {
            transitionRoutes.set(transition.id, {
                start: {
                    x: fromState.x - 18,
                    y: fromState.y - 24,
                },
                end: {
                    x: fromState.x + 18,
                    y: fromState.y - 24,
                },
                control: {
                    x: fromState.x,
                    y: fromState.y - 90,
                },
            })

            return
        }

        const dx = toState.x - fromState.x
        const dy = toState.y - fromState.y
        const distance = Math.hypot(dx, dy)

        if (distance === 0) return

        const ux = dx / distance
        const uy = dy / distance

        const px = -uy
        const py = ux

        const start = {
            x: fromState.x + ux * STATE_RADIUS,
            y: fromState.y + uy * STATE_RADIUS,
        }

        const end = {
            x: toState.x - ux * STATE_RADIUS,
            y: toState.y - uy * STATE_RADIUS,
        }

        const mid = {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
        }

        const pairTransitions = transitions.filter(
            (item) =>
                (item.from === fromState.id &&
                    item.to === toState.id) ||
                (item.from === toState.id &&
                    item.to === fromState.id)
        )

        const pairIndex = pairTransitions.findIndex(
            (item) => item.id === transition.id
        )

        const isFirstConnection = pairIndex === 0

        const candidates: (Point | null)[] = []

        if (isFirstConnection) {
            candidates.push(null)
        }

        const offsets = [
            45,
            -45,
            75,
            -75,
            105,
            -105,
            135,
            -135,
            170,
            -170,
            210,
            -210,
        ]

        offsets.forEach((offset) => {
            candidates.push({
                x: mid.x + px * offset,
                y: mid.y + py * offset,
            })
        })

        for (const control of candidates) {


            if (control === null) {
                const blocked = states.some((state) => {
                    if (
                        state.id === fromState.id ||
                        state.id === toState.id
                    ) {
                        return false
                    }

                    return (
                        pointToSegmentDistance(
                            {
                                x: state.x,
                                y: state.y,
                            },
                            start,
                            end,
                        ) <
                        STATE_RADIUS + PATH_CLEARANCE
                    )
                })

                if (blocked) {
                    continue
                }

                transitionRoutes.set(
                    transition.id,
                    {
                        start,
                        end,
                        control: null,
                    }
                )

                break
            }


            const curvePoints = sampleQuadratic(
                start,
                control,
                end,
            )

            if (
                pathHitsState(
                    curvePoints,
                    states,
                    fromState.id,
                    toState.id,
                )
            ) {
                continue
            }

            const overlapsExistingCurve =
                [...transitionRoutes.values()]
                    .filter(
                        (route) =>
                            route.control !== null
                    )
                    .some((route) => {
                        const existingPoints =
                            sampleQuadratic(
                                route.start,
                                route.control!,
                                route.end,
                            )

                        return curvePoints.some((point, index) => {
                            if (
                                index < 3 ||
                                index > curvePoints.length - 4
                            ) {
                                return false
                            }

                            return existingPoints.some(
                                (
                                    existingPoint,
                                    existingIndex
                                ) => {
                                    if (
                                        existingIndex < 3 ||
                                        existingIndex >
                                            existingPoints.length - 4
                                    ) {
                                        return false
                                    }

                                    return (
                                        distanceBetween(
                                            point,
                                            existingPoint,
                                        ) < 24
                                    )
                                }
                            )
                        })
                    })

            if (overlapsExistingCurve) {
                continue
            }

            transitionRoutes.set(
                transition.id,
                {
                    start,
                    end,
                    control,
                }
            )

            break
        }
    })

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

    const createTransition = () => {
        if (!connectingFrom || !connectionTarget) return

        const symbols = transitionSymbols
            .split(',')
            .map((symbol) => symbol.trim())
            .filter(Boolean)

        if (symbols.length === 0) return

        if (automatonType === 'DFA') {
            const conflictingSymbols = symbols.filter((symbol) =>
                transitions.some(
                    (transition) =>
                        transition.from === connectingFrom &&
                        transition.symbols.includes(symbol)
                )
            )

            if (conflictingSymbols.length > 0) {
                setTransitionError(
                    `DFA conflict: ${conflictingSymbols.join(', ')} already used from this state.`
                )

                return
            }
        }

        setTransitions((currentTransitions) => {
            const existingTransition = currentTransitions.find(
                (transition) =>
                    transition.from === connectingFrom &&
                    transition.to === connectionTarget
            )

            if (existingTransition) {
                return currentTransitions.map((transition) =>
                    transition.id === existingTransition.id
                        ? {
                            ...transition,
                            symbols: [
                                ...new Set([
                                    ...transition.symbols,
                                    ...symbols,
                                ]),
                            ],
                        }
                        : transition
                )
            }

            return [
                ...currentTransitions,
                {
                    id: crypto.randomUUID(),
                    from: connectingFrom,
                    to: connectionTarget,
                    symbols,
                },
            ]
        })

        setTransitionError('')
        setConnectingFrom(null)
        setConnectionTarget(null)
        setTransitionSymbols('')
    }

    const changeTool = (tool: string) => {
        setActiveTool(tool)
        setSelectedState(null)
        setConnectingFrom(null)
        setConnectionTarget(null)
        setTransitionSymbols('')
        setTransitionError('')
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
                    onClick={() => changeTool('select')}
                    data-tooltip="Select"
                >
                    <img src={selectIcon} alt="" />
                </button>

                <button
                    className={`tool-button ${activeTool === 'add' ? 'active' : ''}`}
                    onClick={() => changeTool('add')}
                    data-tooltip="Add State"
                >
                    <img src={addStateIcon} alt="" />
                </button>
                
                <button
                    className={`tool-button ${activeTool === 'connect' ? 'active' : ''}`}
                    onClick={() => changeTool('connect')}
                    data-tooltip="Connect"
                >
                    <img src={connectIcon} alt="" />
                </button>

                <button
                    className={`tool-button ${activeTool === 'start' ? 'active' : ''}`}
                    onClick={() => changeTool('start')}
                    data-tooltip="Start State"
                >
                    <img src={startIcon} alt="" />
                </button>

                <button
                    className={`tool-button ${activeTool === 'accept' ? 'active' : ''}`}
                    onClick={() => changeTool('accept')}
                    data-tooltip="Accept State"
                >
                    <img src={acceptIcon} alt="" />
                </button>

                <button
                    className={`tool-button ${activeTool === 'delete' ? 'active' : ''}`}
                    onClick={() => changeTool('delete')}
                    data-tooltip="Delete"
                >
                    <img src={deleteIcon} alt="" />
                </button>

            </div>

            <div
                className={`canvas-area tool-${activeTool}`}
                onClick={(event) => {

                    if (activeTool === 'select') {
                        setSelectedState(null)
                        return
                    }

                    if (activeTool !== 'add') return

                    const rect = event.currentTarget.getBoundingClientRect()

                    const x = event.clientX - rect.left
                    const y = event.clientY - rect.top

                    addState(x, y)
                }}
            >

                <svg className="transition-layer">
                    <defs>
                        <marker
                            id="transition-arrow"
                            viewBox="0 0 10 10"
                            refX="9"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto"
                        >
                            <path d="M 0 0 L 10 5 L 0 10 z" />
                        </marker>
                    </defs>
                    {transitions.map((transition) => {
                        const route = transitionRoutes.get(transition.id)

                        if (!route) return null

                        const labelX = route.control
                            ? 0.25 * route.start.x +
                            0.5 * route.control.x +
                            0.25 * route.end.x
                            : (route.start.x + route.end.x) / 2

                        const labelY = route.control
                            ? 0.25 * route.start.y +
                            0.5 * route.control.y +
                            0.25 * route.end.y
                            : (route.start.y + route.end.y) / 2

                        return (
                            <g key={transition.id}>
                                {route.control ? (
                                    <path
                                        className="transition-line"
                                        d={`
                                            M ${route.start.x} ${route.start.y}
                                            Q ${route.control.x} ${route.control.y}
                                            ${route.end.x} ${route.end.y}
                                        `}
                                        markerEnd="url(#transition-arrow)"
                                    />
                                ) : (
                                    <line
                                        className="transition-line"
                                        x1={route.start.x}
                                        y1={route.start.y}
                                        x2={route.end.x}
                                        y2={route.end.y}
                                        markerEnd="url(#transition-arrow)"
                                    />
                                )}

                                <text
                                    x={labelX}
                                    y={labelY - 8}
                                    className="transition-label"
                                    textAnchor="middle"
                                >
                                    {transition.symbols.join(',')}
                                </text>
                            </g>
                        )
                    })}
                </svg>

                {states.length === 0 && (
                    <p>Build your automaton here.</p>
                )}

                {states.map((state) => (
                    <div
                        key={state.id}
                        className={`state-node 
                            ${selectedState === state.id ? 'selected' : ''}
                            ${connectingFrom === state.id ? 'connecting-source' : ''}
                        `}
                        style={{
                            left: state.x,
                            top: state.y,
                        }}
                        onClick={(event) => {
                            event.stopPropagation()

                            if (activeTool === 'select') {
                                selectState(state.id)
                                return
                            }

                            if (activeTool === 'connect') {
                                if (!connectingFrom) {
                                    setConnectingFrom(state.id)
                                } else {
                                    setConnectionTarget(state.id)
                                }
                            }
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
                        {connectingFrom === state.id && (
                            <span className="connection-label">SOURCE</span>
                        )}
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
                {connectingFrom && connectionTarget && (
                    <div className="transition-popup">
                        <span>SYMBOLS</span>

                        <input
                            type="text"
                            value={transitionSymbols}
                            onChange={(event) =>
                                setTransitionSymbols(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    createTransition()
                                }
                                
                                if (event.key === 'Escape') {
                                    setConnectingFrom(null)
                                    setConnectionTarget(null)
                                    setTransitionSymbols('')
                                }
                            }}

                            placeholder="0,1"
                            autoFocus
                        />

                        {transitionError && (
                                <p className="transition-error">
                                    {transitionError}
                                </p>
                        )}

                        <button onClick={createTransition}>
                            Connect
                        </button>

                        <button
                            onClick={() => {
                                setConnectingFrom(null)
                                setConnectionTarget(null)
                                setTransitionSymbols('')
                                setTransitionError('')
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Canvas