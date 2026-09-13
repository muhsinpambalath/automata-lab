import { useState } from 'react'
import type {
    State,
    Transition,
    AutomatonType,
} from '../models/automaton'
import './AutomataLab.css'
import Canvas from '../components/labs/Canvas/Canvas'
import TransitionTable from '../components/labs/Transition Table/TransitionTable'



function AutomataLab() {

    const [states, setStates] = useState<State[]>([])
    const [transitions, setTransitions] = useState<Transition[]>([])
    const [automatonType, setAutomatonType] = useState<AutomatonType>('DFA')

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
                    />
                </div>

                <aside className='lab-controls'>
                    <h2>Controls</h2>
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