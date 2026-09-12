import { useState } from 'react'
import type { AutomatonType } from '../models/automaton'
import './AutomataLab.css'
import Canvas from '../components/labs/Canvas/Canvas'



function AutomataLab() {

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
                    <Canvas automatonType = {automatonType} />
                </div>

                <aside className='lab-controls'>
                    <h2>Controls</h2>
                </aside>

                <section className='lab-table'>
                    <h2>Transition Table</h2>
                </section>

            </section>
        </main>
    )
}

export default AutomataLab