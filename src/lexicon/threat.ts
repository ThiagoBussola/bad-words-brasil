import { LexiconGroup, words } from './group';

/**
 * Ameaça à integridade de alguém.
 *
 * "Me matar" / "quero morrer" (risco da própria pessoa) ficam de fora: o
 * filtro de conteúdo do chat Wepsy trata crise de forma separada e nunca
 * bloqueia em silêncio. Aqui só entra ameaça dirigida a outro.
 */
export const threat: LexiconGroup[] = [
    {
        category: 'threat',
        severity: 'high',
        terms: [
            '(vou|vo|irei) te (matar|espancar|quebrar|estropiar|estrangular|esfaquear|atirar|estuprar)',
            '(vou|vo|irei) (matar|espancar|quebrar|estropiar) {vc}',
            '(vou|vo|irei) (acabar|destruir) (com |)(voce|vc|tua vida|sua vida|tua carreira|sua carreira)',
            '(voce|vc|tu) (vai|vao) (morrer|se arrepender|pagar (por isso|caro|muito))',
            '(toma|tome) cuidado (comigo|com o que eu faco|com o que eu sou capaz)',
            '(eu |)(sei|tenho) (onde voce mora|seu endereco|seu cpf|sua familia)',
            '(vou|vo) (depois |amanha |)(na|pra|para a) (sua |tua |)(casa|trabalho|empresa)',
            '(se |quando )(voce |vc |tu |)(nao |)(fizer|fizer o que eu quero|me atender|me pagar) (eu |)(te |vou te |)(matar|machucar|expor|destruir)',
            '(teu|seu) (filho|filha|pai|mae|marido|esposa) (vai|vao) (pagar|se arrepender|ver)',
            'vou te (achar|encontrar) e te (matar|foder|foder a vida)',
            'te (mato|quebro|espanco) (se|caso|quando) (voce|vc|tu)',
            'morre (logo|logo logo|sua|seu)',
            'te (espero|pego) (na|pra|para a) (saida|rua|porta)',
        ].concat(words(`
            te mato te quebro te espanco te estupro te estrangulo
        `)),
    },
];
