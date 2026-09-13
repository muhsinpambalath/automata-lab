import type {
    State,
    Transition,
    AutomatonType,
} from '../../../models/automaton'
import './TransitionTable.css'

type TransitionTableProps = {
    states: State[]
    transitions: Transition[]
    automatonType: AutomatonType
}

function TransitionTable({
    states,
    transitions,
    automatonType,
}: TransitionTableProps) {
    const symbols = [...new Set(
        transitions.flatMap((transition) => transition.symbols)
    )]

    return (
        <div className="transition-table-container">
            <div className="transition-table-header">
                <span>TRANSITION TABLE</span>
                <span>{automatonType}</span>
            </div>

            {symbols.length === 0 ? (
                <div className="transition-table-empty">
                    No transitions yet.
                </div>
            ) : (
                <table className="transition-table">
                    <thead>
                        <tr>
                            <th>STATE</th>

                            {symbols.map((symbol) => (
                                <th key={symbol}>{symbol}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {states.map((state) => (
                            <tr key={state.id}>
                                <th>
                                    {state.isStart && '→ '}
                                    {state.isAccept && '* '}
                                    {state.label}
                                </th>

                                {symbols.map((symbol) => {
                                    const destinations = transitions
                                        .filter(
                                            (transition) =>
                                                transition.from === state.id &&
                                                transition.symbols.includes(symbol)
                                        )
                                        .map((transition) =>
                                            states.find(
                                                (target) =>
                                                    target.id === transition.to
                                            )?.label
                                        )
                                        .filter(Boolean)

                                    return (
                                        <td key={symbol}>
                                            {destinations.length > 0
                                                ? automatonType === 'NFA'
                                                    ? `{${destinations.join(', ')}}`
                                                    : destinations[0]
                                                : '∅'}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default TransitionTable