export type {
    Analysis,
    Category,
    CensorOptions,
    CensorStyle,
    Filter,
    FilterOptions,
    Match,
    MatchKind,
    Severity,
    TermInput,
} from './types';

export { normalize, termKey } from './normalize';
export { createFilter, analyze, isProfane, censor, preventableWord } from './filter';
