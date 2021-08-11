import { preventableWord } from '../src/index'

test('palavrão que deve ser evitado', () => {
  expect(preventableWord('babaca')).toBe(true)
})

test('palavrão que deve ser evitado numa frase', () => {
  expect(preventableWord('que cara mais babaca')).toBe(true)
})

test('frase normal', () => {
  expect(preventableWord('que cara mais legal')).toBe(false)
})


