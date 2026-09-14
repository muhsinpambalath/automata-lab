import type { State, Transition } from '../../models/automaton'

export type SimulationResult = {
    accepted: boolean
    path: string[]
    invalidSymbol?: string
}

export function simulateDFA(
    states: State[],
    transitions: Transition[],
    input: string
): SimulationResult {
    const startState = states.find((state) => state.isStart)

    if (!startState) {
        return {
            accepted: false,
            path: [],
        }
    }

    let currentState = startState.id
    const path = [currentState]

    for (const symbol of input) {
        const transition = transitions.find(
            (transition) =>
                transition.from === currentState &&
                transition.symbols.includes(symbol)
        )

        if (!transition) {
            return {
                accepted: false,
                path,
                invalidSymbol: symbol,
            }
        }

        currentState = transition.to
        path.push(currentState)
    }

    const finalState = states.find(
        (state) => state.id === currentState
    )

    return {
        accepted: finalState?.isAccept ?? false,
        path,
    }
}