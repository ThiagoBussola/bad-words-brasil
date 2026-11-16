'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { analyze, createFilter, preventableWord } = require('../dist/cjs/index.js');

describe('analyze / preventableWord', () => {
    it('detecta palavrão simples', () => {
        const result = analyze('que merda');
        assert.equal(result.flagged, true);
        assert.ok(result.matches.some(m => m.term.includes('merda')));
    });

    it('frase limpa não marca', () => {
        assert.equal(analyze('bom dia, tudo bem?').flagged, false);
        assert.equal(preventableWord('feliz'), false);
    });

    it('compat: preventableWord devolve boolean', () => {
        assert.equal(preventableWord('otario'), true);
        assert.equal(preventableWord('amigo'), false);
    });

    it('acento e caixa não escapam', () => {
        assert.equal(analyze('Otário').flagged, true);
        assert.equal(analyze('CARALHO').flagged, true);
    });

    it('leet e símbolos', () => {
        assert.equal(analyze('m3rd@').flagged, true);
        assert.equal(analyze('p0rr4').flagged, true);
        assert.equal(analyze('@rrombado').flagged, true);
    });

    it('letras repetidas', () => {
        assert.equal(analyze('puuuta').flagged, true);
        assert.equal(analyze('merdaaaa').flagged, true);
    });

    it('letras espaçadas / pontuadas', () => {
        assert.equal(analyze('p.u.t.a').flagged, true);
        assert.equal(analyze('f o d a').flagged, true);
    });

    it('máscara parcial', () => {
        const masked = analyze('fod***');
        assert.equal(masked.flagged, true);
        assert.equal(masked.matches[0].kind, 'masked');
        assert.ok(masked.matches[0].term.startsWith('fod'));
        assert.equal(analyze('p*rra').flagged, true);
        assert.equal(analyze('car*lho').flagged, true);
    });

    it('expressão de várias palavras', () => {
        const result = analyze('vai tomar no cu');
        assert.equal(result.flagged, true);
        assert.ok(result.matches.some(m => m.kind === 'phrase' || m.term.includes('cu')));
    });

    it('categorias e severidade', () => {
        const hate = analyze('seu retardado');
        assert.ok(hate.categories.includes('hate') || hate.categories.includes('insult'));
        assert.ok(hate.severity === 'high' || hate.severity === 'medium');

        const threat = analyze('vou te matar');
        assert.equal(threat.flagged, true);
        assert.ok(threat.categories.includes('threat'));
        assert.equal(threat.severity, 'high');
    });

    it('dirigido sobe gravidade', () => {
        const alone = analyze('idiota');
        const directed = analyze('seu idiota');
        assert.equal(alone.flagged, true);
        assert.equal(directed.flagged, true);
        assert.equal(directed.matches[0].directed, true);
        // low → medium quando dirigido
        assert.ok(
            alone.severity === 'low' || alone.severity === 'medium',
        );
        assert.ok(
            directed.severity === 'medium' || directed.severity === 'high',
        );
    });

    it('ambíguo inocente não marca no modo padrão', () => {
        // "pau" sozinho (madeira / sentido comum)
        assert.equal(analyze('o pau da cadeira quebrou').flagged, false);
        // disfarçado ou dirigido marca
        assert.equal(analyze('seu pau').flagged, true);
    });

    it('auto-desabafo com "lixo" não é assédio', () => {
        // "lixo" ambíguo sem direcionamento
        assert.equal(analyze('me sinto um lixo').flagged, false);
    });

    it('allow-list desliga termo', () => {
        const filter = createFilter({ allow: ['merda'] });
        assert.equal(filter.analyze('que merda').flagged, false);
        assert.equal(filter.analyze('caralho').flagged, true);
    });

    it('remove e add', () => {
        const filter = createFilter({
            remove: ['merda'],
            add: [{ term: 'abacaxi', category: 'profanity', severity: 'low' }],
        });
        assert.equal(filter.analyze('merda').flagged, false);
        assert.equal(filter.analyze('abacaxi').flagged, true);
    });

    it('filtra por categoria', () => {
        const filter = createFilter({ categories: ['threat'] });
        assert.equal(filter.analyze('merda').flagged, false);
        assert.equal(filter.analyze('vou te matar').flagged, true);
    });

    it('minSeverity', () => {
        const filter = createFilter({ minSeverity: 'high' });
        assert.equal(filter.analyze('merda').flagged, false);
        assert.equal(filter.analyze('vou te matar').flagged, true);
    });

    it('posições batem com o texto original', () => {
        const text = 'oi merda tchau';
        const result = analyze(text);
        assert.equal(result.matches.length, 1);
        const m = result.matches[0];
        assert.equal(text.slice(m.start, m.end), m.raw);
        assert.ok(m.raw.toLowerCase().includes('merda'));
    });

    it('tipo errado lança TypeError', () => {
        assert.throws(() => analyze(123), TypeError);
        assert.throws(() => preventableWord(null), TypeError);
    });
});
