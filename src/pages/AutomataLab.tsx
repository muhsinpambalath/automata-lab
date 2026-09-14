import { useEffect, useState } from 'react'
import type {
    State,
    Transition,
    AutomatonType,
} from '../models/automaton'
import './AutomataLab.css'
import Canvas from '../components/labs/Canvas/Canvas'
import TransitionTable from '../components/labs/Transition Table/TransitionTable'
import { simulateDFA } from '../logic/automata/simulate'



function AutomataLab() {

    const [states, setStates] = useState<State[]>([])
    const [transitions, setTransitions] = useState<Transition[]>([])
    const [automatonType, setAutomatonType] = useState<AutomatonType>('DFA')
    const [simulationInput, setSimulationInput] = useState('')
    const [simulationPosition, setSimulationPosition] = useState(-1)
    const [simulationTransition, setSimulationTransition] = useState<string | null>(null)
    const [simulationPulsing, setSimulationPulsing] = useState(false)
    const [simulationPath, setSimulationPath] = useState<string[]>([])
    const [simulationInvalidSymbol, setSimulationInvalidSymbol] =
        useState<string | undefined>(undefined)
    const [simulationRunning, setSimulationRunning] = useState(false)
    const [simulationResult, setSimulationResult] = useState<
        'accepted' | 'rejected' | 'invalid' | null
    >(null)

    const runSimulation = () => {
        if (simulationInput.length === 0) return

        const startState = states.find((state) => state.isStart)

        if (!startState) {
            setSimulationResult('invalid')
            return
        }

        const result = simulateDFA(
            states,
            transitions,
            simulationInput
        )

        if (result.path.length === 0) {
            setSimulationResult('invalid')
            return
        }

        setSimulationPath(result.path)
        setSimulationInvalidSymbol(result.invalidSymbol)

        setSimulationPosition(0)

        const firstTransition = transitions.find(
            (transition) =>
                transition.from === result.path[0] &&
                transition.to === result.path[1]
        )

        setSimulationTransition(firstTransition?.id ?? null)

        setSimulationResult(null)
        setSimulationRunning(true)
    }

    useEffect(() => {
        if (!simulationRunning) return

        setSimulationPulsing(true)

        const pulseTimer = setTimeout(() => {
            setSimulationPulsing(false)

            if (simulationPosition >= simulationPath.length - 1) {
                const finalState = states.find(
                    (state) =>
                        state.id === simulationPath[simulationPosition]
                )

                const finishTimer = setTimeout(() => {
                    setSimulationRunning(false)
                    setSimulationPulsing(false)
                    setSimulationTransition(null)

                    if (simulationInvalidSymbol) {
                        setSimulationResult('invalid')
                    } else {
                        setSimulationResult(
                            finalState?.isAccept
                                ? 'accepted'
                                : 'rejected'
                        )
                    }
                }, 250)

                return () => clearTimeout(finishTimer)
            }

            const pauseTimer = setTimeout(() => {
                const nextPosition = simulationPosition + 1

                setSimulationPosition(nextPosition)

                const nextTransition = transitions.find(
                    (transition) =>
                        transition.from === simulationPath[nextPosition] &&
                        transition.to === simulationPath[nextPosition + 1]
                )

                setSimulationTransition(nextTransition?.id ?? null)
            }, 300)

            return () => clearTimeout(pauseTimer)
        }, 350)

        return () => clearTimeout(pulseTimer)
    }, [
        simulationRunning,
        simulationPosition,
        simulationPath,
        simulationInvalidSymbol,
        states,
        transitions,
    ])

    return (
        <main className='lab-page'>
            <header className='lab-header'>
                <div>
                    <p className='lab-kicker'>AUTOMATA LAB</p>
                    <h1>Build your machine.</h1>
                </div>

                <select
                    className="machine-selector"
                    value={automatonType}
                    onChange={(event) =>
                        setAutomatonType(event.target.value as AutomatonType)
                    }
                >
                    <option value="DFA">DFA</option>
                    <option value="NFA">NFA</option>
                </select>

            </header>

            <section className='lab-workspace'>
                <div className='lab-canvas'>
                    <Canvas
                        automatonType={automatonType}
                        states={states}
                        setStates={setStates}
                        transitions={transitions}
                        setTransitions={setTransitions}
                        simulationTransition={simulationTransition}
                        simulationPulsing={simulationPulsing}
                    />
                </div>

                <aside className='lab-controls'>
                    <h2>Controls</h2>

                    <div className="simulation-controls">
                        <div className="simulation-section-label">
                            SIMULATION
                        </div>

                        <label htmlFor="simulation-input">
                            INPUT STRING
                        </label>

                        <div className="simulation-input-row">
                            <input
                                id="simulation-input"
                                type="text"
                                value={simulationInput}
                                onChange={(event) => {
                                    setSimulationInput(event.target.value)
                                    setSimulationResult(null)
                                    setSimulationPosition(-1)
                                    setSimulationTransition(null)
                                    setSimulationPulsing(false)
                                    setSimulationPath([])
                                    setSimulationInvalidSymbol(undefined)
                                    setSimulationRunning(false)
                                }}
                                placeholder="e.g. 01001"
                                disabled={simulationRunning}
                            />

                            <button
                                type="button"
                                onClick={runSimulation}
                                disabled={
                                    simulationRunning ||
                                    simulationInput.length === 0 ||
                                    states.length === 0
                                }
                            >
                                {simulationRunning ? 'RUNNING...' : 'RUN'}
                            </button>
                        </div>

                        {states.length === 0 ? (
                            <div className="simulation-status idle">
                                <strong>BUILD A MACHINE FIRST</strong>
                                <span>
                                    Create at least one state before running
                                    a simulation.
                                </span>
                            </div>
                        ) : simulationResult ? (
                            <div className={`simulation-status ${simulationResult}`}>
                                <strong>
                                    {simulationResult === 'accepted' && 'ACCEPTED'}
                                    {simulationResult === 'rejected' && 'REJECTED'}
                                    {simulationResult === 'invalid' && 'INVALID INPUT'}
                                </strong>

                                {simulationResult === 'invalid' && simulationInvalidSymbol && (
                                    <span>
                                        Symbol <code>{simulationInvalidSymbol}</code> has no valid transition.
                                    </span>
                                )}

                                {simulationResult === 'accepted' && (
                                    <span>
                                        The input string was accepted by the machine.
                                    </span>
                                )}

                                {simulationResult === 'rejected' && (
                                    <span>
                                        The machine finished in a non-accepting state.
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="simulation-status idle">
                                <strong>READY</strong>
                                <span>
                                    Enter an input string and run the machine.
                                </span>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="lab-table">
                    <TransitionTable
                        states={states}
                        transitions={transitions}
                        automatonType={automatonType}
                    />
                </div>

            </section>
        </main>
    )
}

export default AutomataLab