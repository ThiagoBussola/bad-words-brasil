import type { LexiconGroup } from './group';
import { hate } from './hate';
import { harassment } from './harassment';
import { insult } from './insult';
import { profanity } from './profanity';
import { sexual } from './sexual';
import { threat } from './threat';

/** Léxico padrão, na ordem em que os grupos entram na compilação. */
export const defaultLexicon: readonly LexiconGroup[] = [
    ...profanity,
    ...insult,
    ...sexual,
    ...hate,
    ...harassment,
    ...threat,
];

export type { LexiconGroup } from './group';
export { words } from './group';
