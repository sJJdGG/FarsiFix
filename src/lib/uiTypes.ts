export type Phase = 'idle' | 'parsing' | 'normalizing' | 'compressing' | 'done' | 'error'

const BUSY_PHASES: Phase[] = ['parsing', 'normalizing', 'compressing']

export const isBusyPhase = (phase: Phase) => BUSY_PHASES.includes(phase)
