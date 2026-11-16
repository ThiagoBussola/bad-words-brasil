'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { normalize, termKey } = require('../dist/cjs/index.js');

describe('normalize', () => {
    it('baixa e tira acento', () => {
        assert.equal(normalize('Otário'), 'otario');
        assert.equal(normalize('MERDA'), 'merda');
    });

    it('lê leet básico', () => {
        assert.equal(normalize('m3rd@'), 'merda');
        assert.equal(normalize('p0rr4'), 'porra');
    });

    it('ignora pontuação solta e mantém palavras', () => {
        assert.equal(normalize('  oi, tudo bem?  '), 'oi tudo bem');
    });

    it('termKey não lê dígito como letra', () => {
        assert.equal(termKey('otário'), 'otario');
        assert.equal(termKey('m3rda'), 'mrda');
    });
});
