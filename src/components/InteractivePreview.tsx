import { useEffect, useState } from 'react'
import './InteractivePreview.css'

function InteractivePreview() {
    const [input, setInput] = useState('1101')
    const [currentIndex, setCurrentIndex] = useState<number | null>(null)
    const [currentState, setCurrentState] = useState('q0')
    const [running, setRunning] = useState(false)
    const [error, setError] = useState('')
    const [pulsing, setPulsing] = useState(false)
    const [result, setResult] = useState<'accepted' | 'rejected' | null>(null)
    
    const isValidInput = /^[01]*$/.test(input)
    
    const runMachine = () => {

        setError('')
        setResult(null)
        setCurrentState('q0')
        setCurrentIndex(0)
        setRunning(true)

        if (!isValidInput || input.length === 0 || running) {
            if (!isValidInput) {
                setError('Only 0 and 1 are allowed.')
            }
    
            return
        }
    
        setError('')
        setCurrentState('q0')
        setCurrentIndex(0)
        setRunning(true)
    }

    const resetMachine = () => {
        setInput('')
        setCurrentIndex(null)
        setCurrentState('q0')
        setRunning(false)
        setPulsing(false)
        setResult(null)
        setError('')
    }

    useEffect(() => {
        if (!running || currentIndex === null) return

        setPulsing(true)

        const pulseTimer = setTimeout(() => {
            setPulsing(false)

            const symbol = input[currentIndex]

            if (symbol !== '0' && symbol !== '1') {
                setError(`INVALID SYMBOL: ${symbol}`)
                setCurrentIndex(null)
                setCurrentIndex(null)
                setRunning(false)
                setPulsing(false)
                setResult(null)

                return
            }

            setCurrentState((state) => {
                if (state === 'q0' && symbol === '0') {
                    return 'q1'
                }

                return state
            })

            const pauseTimer = setTimeout(() => {
                if (currentIndex >= input.length - 1) {
                    const finalState =
                        currentState === 'q0' && symbol === '0'
                            ? 'q1'
                            : currentState

                    setCurrentState(finalState)

                    setTimeout(() => {
                        setCurrentIndex(null)
                        setRunning(false)

                        setResult(
                            finalState === 'q1'
                                ? 'accepted'
                                : 'rejected'
                        )
                    }, 200)
                } else {
                    setCurrentIndex(currentIndex + 1)
                }
            }, 500)

            return () => clearTimeout(pauseTimer)

        }, 350)

        return () => clearTimeout(pulseTimer)
    }, [running, currentIndex, input])

    const currentSymbol =
        currentIndex !== null ? input[currentIndex] : null

    const q0LoopActive =
        pulsing && currentState === 'q0' && currentSymbol === '1'

    const q0ToQ1Active =
        pulsing && currentState === 'q0' && currentSymbol === '0'

    const q1LoopActive =
        pulsing && currentState === 'q1' && currentSymbol !== null

    const finalStateActive =
        result === 'accepted'


    return (
        <div className="interactive-preview">

            <div className="preview-header">
                <span>LIVE AUTOMATION</span>
                <span className="status">● READY</span>
            </div>

            <svg
                className="automation"
                viewBox="0 0 600 240"
                role="img"
                aria-label="Interactive finite automaton"
            >
                <defs>
                    <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                </defs>

                <line
                    className="start-arrow-hero"
                    x1="120"
                    y1="100"
                    x2="150"
                    y2="110"
                    markerEnd="url(#arrow)"
                />

                <line
                    className={q0ToQ1Active ? 'active-transition' : ''}
                    x1="210"
                    y1="120"
                    x2="390"
                    y2="120"
                    markerEnd="url(#arrow)"
                />

                <path
                    className={q0LoopActive ? 'active-transition' : ''}
                    d="M 160 95 C 130 35, 230 35, 200 95"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                />

                <path
                    className={q1LoopActive ? 'active-transition' : ''}
                    d="M 400 95 C 370 35, 470 35, 440 95"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                />

                <circle cx="180" cy="120" r="30" />

                <circle cx="420" cy="120" r="30" className={finalStateActive ? 'final-state-active' : ''} />
                <circle cx="420" cy="120" r="26" className={finalStateActive ? 'final-state-active' : ''} />

                <text x="180" y="125" textAnchor="middle">q0</text>
                <text x="420" y="125" textAnchor="middle">q1</text>

                <text x="300" y="105" textAnchor="middle" className={q0ToQ1Active ? 'active-label' : ''}>0</text>
                <text x="180" y="35" textAnchor="middle" className={q0LoopActive ? 'active-label' : ''}>1</text>
                <text x="420" y="35" textAnchor="middle" className={q1LoopActive ? 'active-label' : ''}>0,1</text>
            </svg>

            <div className="preview-controls">
                <span>INPUT :</span>

                <input
                    type="text"
                    value={input}
                    onChange={(event) => {
                        setInput(event.target.value)
                        setError('')
                        setResult(null)
                        setCurrentIndex(null)
                        setCurrentState('q0')
                        setRunning(false)
                        setPulsing(false)
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            runMachine()
                        }
                    }}
                    maxLength={20}
                />

                <button onClick={runMachine} disabled={running}>
                    Run
                </button>

                <button onClick={resetMachine}>
                    Reset
                </button>
            </div>

            {error && (
                <p className="input-error">
                    {error}
                </p>
            )}

            {result && (
                <p className={`simulation-result ${result}`}>
                    {result === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
                </p>
            )}

        </div>
    )
}

export default InteractivePreview