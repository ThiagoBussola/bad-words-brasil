import { LexiconGroup } from './group';

/**
 * Investida sexual ou perseguição dirigida a alguém.
 *
 * Frases curtas e claras. O motor não interpreta intenção: se a expressão
 * casa, ela é apontada. Frases ambíguas de flerte leve ("você é linda")
 * ficam de fora de propósito.
 */
export const harassment: LexiconGroup[] = [
    {
        category: 'harassment',
        severity: 'high',
        terms: [
            '(manda|me manda|manda me|manda pra mim) (um |uma |uns |umas |)(nude|nudes|foto pelada|foto nua|pack)',
            '(quero|to querendo|to a fim de) (te |)(comer|foder|fuder|meter|gozar|chupar)',
            '(me |)(deixa|deixe) te (comer|foder|fuder|chupar)',
            '(vou|quero) te (foder|fuder|comer|meter|estupra?r?)',
            'abre as (pernas|coxas) (pra mim|para mim|ai)',
            '(mostra|me mostra) (a |o |)(buceta|xota|xoxota|peito|peitos|bunda|cu)',
            '(sent(a|e)|senta aqui) (nessa|nessa |)(rola|pica|pau|piroca)',
            '(vem |venha |)(sentar|sentar nessa|mamar|chupar) (nessa |nessa |)(rola|pica|pau|piroca)',
            '(voce |tu |)(e|eh|ta) (uma |)(gostosa|safada|vadia|putinha) (ne|hein|nehe|)',
            'goza (pra|para|com) mim',
            'faz um boquete (em mim|pra mim|para mim|ai)',
            'te (pago|dou) (pra|para) (transar|foder|fuder|fazer sexo)',
            '(me |)liga pelad(a|o)',
            'quero ver voce pelad(a|o)',
            'voce me deixa (duro|molhada|excitado|excitada)',
            '(vem|venha) (pro|para o|pra) (meu |)quarto (agora|ai|)',
            'nao (vou|saio) (te |)(deixar em paz|parar de te mandar mensagem)',
            'sei onde voce (mora|trabalha|estuda)',
            'vou (te |)(seguir|achar|encontrar) (onde voce estiver|na rua|na sua casa)',
        ],
    },
];
