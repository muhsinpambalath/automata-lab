import './AutomataLab.css'
import Canvas from '../components/labs/Canvas/Canvas'



function AutomataLab() {
    return (
        <main className='lab-page'>
            <header className='lab-header'>
                <div>
                    <p className='lab-kicker'>AUTOMATA LAB</p>
                    <h1>Build your machine.</h1>
                </div>

                <span className='lab-status'>DFA</span>

            </header>

            <section className='lab-workspace'>
                <div className='lab-canvas'>
                    <Canvas />
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