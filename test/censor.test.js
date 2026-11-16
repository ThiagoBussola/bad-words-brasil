'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { censor, createFilter } = require('../dist/cjs/index.js');

describe('censor', () => {
    it('substitui por asteriscos', () => {
        const out = censor('que merda hein');
        assert.equal(out.toLowerCase().includes('merda'), false);
        assert.match(out, /\*+/);
        assert.ok(out.endsWith(' hein'));
    });

    it('keep-first', () => {
        const out = censor('caralho', { style: 'keep-first' });
        assert.equal(out[0].toLowerCase(), 'c');
        assert.ok(out.slice(1).split('').every(c => c === '*'));
    });

    it('keep-edges', () => {
        const out = censor('merda', { style: 'keep-edges' });
        assert.equal(out[0].toLowerCase(), 'm');
        assert.equal(out[out.length - 1].toLowerCase(), 'a');
        assert.ok(out.slice(1, -1).split('').every(c => c === '*'));
    });

    it('replace customizado', () => {
        const out = censor('que merda', {
            replace: () => '[censurado]',
        });
        assert.equal(out, '[censurado]');
    });

    it('máscara no texto de entrada também é censurada', () => {
        const out = censor('olha que fod***');
        assert.equal(out.includes('fod'), false);
    });

    it('texto limpo volta igual', () => {
        assert.equal(censor('bom dia'), 'bom dia');
    });

    it('instância com allow não censura o termo liberado', () => {
        const filter = createFilter({ allow: ['merda'] });
        assert.equal(filter.censor('que merda'), 'que merda');
    });
});
