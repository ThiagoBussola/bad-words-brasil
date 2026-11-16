# bad-words-brasil

Filtro de palavrões e abuso em **português do Brasil**.

Detecta ofensa mesmo com acento, leet (`m3rd@`), letras repetidas (`puuuta`),
espaçadas (`p.u.t.a`) ou mascaradas (`fod***`). Devolve categoria, gravidade e
posição — ou só censura o trecho.

> **v2.** A v1 (`preventableWord`) continua funcionando. O pacote agora publica
> JavaScript compilado (CJS + ESM + tipos); não aponte mais para `.ts` cru.

## Instalar

```bash
npm install bad-words-brasil
```

## Uso rápido

```js
import { analyze, censor, preventableWord } from 'bad-words-brasil';

preventableWord('otario');          // true  (compatível com a v1)
preventableWord('feliz');           // false

analyze('seu idiota');
// {
//   flagged: true,
//   severity: 'medium',
//   categories: ['insult'],
//   matches: [{ term: 'idiota', category: 'insult', severity: 'medium',
//               kind: 'exact', raw: 'idiota', start: 4, end: 10, directed: true }]
// }

censor('que merda hein');           // 'que ***** hein'
censor('caralho', { style: 'keep-first' }); // 'c******'
```

CommonJS:

```js
const { analyze, censor } = require('bad-words-brasil');
```

## API

### `analyze(text) → Analysis`

| Campo | Significado |
|-------|-------------|
| `flagged` | Há pelo menos um termo apontado |
| `severity` | Maior gravidade (`low` \| `medium` \| `high`), ou `null` |
| `categories` | Categorias encontradas, sem repetição |
| `matches` | Ocorrências em ordem, sem sobreposição |

Cada ocorrência traz `term`, `category`, `severity`, `kind`
(`exact` \| `obfuscated` \| `masked` \| `phrase`), `raw`, `start`, `end`,
`directed`.

### `isProfane(text) → boolean`

Atalho para `analyze(text).flagged`.

### `censor(text, options?) → string`

Substitui as ocorrências. Opções:

- `mask` — caractere da máscara (padrão `*`)
- `style` — `full` (padrão), `keep-first`, `keep-edges`
- `replace(match)` — substituição própria

### `preventableWord(text) → boolean`

Compatível com a v1. Tipo errado lança `TypeError`.

### `createFilter(options) → Filter`

Instância com léxico ajustado:

```js
import { createFilter } from 'bad-words-brasil';

const filter = createFilter({
  categories: ['hate', 'harassment', 'threat'],
  minSeverity: 'medium',
  allow: ['merda'],                          // não apontar
  remove: ['bosta'],                         // tirar do léxico
  add: [{ term: 'abacaxi', category: 'profanity', severity: 'low' }],
  strict: false,                             // true = aponta ambíguos soltos
});

filter.analyze('...');
filter.censor('...');
filter.isProfane('...');
```

### `normalize(text) → string`

Forma canônica (minúsculas, sem acento, leet resolvido). Útil para listas próprias.

## Categorias

| Categoria | Uso |
|-----------|-----|
| `profanity` | Palavrão sem alvo |
| `insult` | Ofensa a uma pessoa |
| `sexual` | Vocabulário sexual explícito |
| `hate` | Discriminação |
| `harassment` | Investida / perseguição |
| `threat` | Ameaça à integridade |

Palavras ambíguas (`pau`, `vaca`, `lixo`) **só** entram no modo padrão quando
dirigidas a alguém (`seu pau`) ou disfarçadas. Assim, *"me sinto um lixo"* e
*"o pau da cadeira"* não marcam.

Termos clínicos e de identidade (`pênis`, `vagina`, `homossexual`, `autismo`)
ficam de fora de propósito.

## O que a v2 passa a pegar

| Entrada | v1 | v2 |
|---------|----|----|
| `otario` | sim | sim |
| `otário` | não | sim |
| `0tario` | não | sim |
| `o t a r i o` | não | sim |
| `fod***` | não | sim |
| `vai tomar no cu` | só `cu` | expressão |
| categoria / posição | não | sim |

## Uso em moderação de chat (Wepsy)

Sugestão: bloquear `hate`, `harassment` e `threat`, e `insult`/`sexual` a
partir de `medium`. Palavrão `low` pode passar. Mensagem de crise (risco de
vida) **nunca** deve ser bloqueada em silêncio — trate fora deste pacote.

```js
const filter = createFilter({
  categories: ['insult', 'sexual', 'hate', 'harassment', 'threat'],
  minSeverity: 'medium',
});
```

## Desenvolvimento

```bash
npm install
npm test          # build + node:test
npm pack          # gera bad-words-brasil-2.0.0.tgz
```

Node 18+. Sem dependências de runtime.

## Licença

ISC
