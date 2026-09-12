export type State = {
    id: string
    label: string
    x: number
    y: number
    isStart: boolean
    isAccept: boolean
}

export type Transition = {
    id: string
    from: string
    to: string
    symbols: string[]
}

export type AutomatonType = 'DFA' | 'NFA'