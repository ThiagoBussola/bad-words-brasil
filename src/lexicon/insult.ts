import { LexiconGroup, words } from './group';

/**
 * Ofensa a uma pessoa.
 *
 * Xingamento leve fica em `low` porque também aparece em desabafo sobre si
 * ("me senti um idiota"). Quando vem dirigido ("seu idiota", "você é um
 * idiota") o motor sobe um nível.
 *
 * Crítica não é ofensa: "incompetente", "mentiroso", "charlatão" e parecidas
 * ficam de fora de propósito, para não calar reclamação legítima.
 */
export const insult: LexiconGroup[] = [
    {
        category: 'insult',
        severity: 'low',
        terms: words(`
            idiota imbecil babaca otari(o|a) trouxa estupid(o|a) cretin(o|a) panaca paspalh(o|a)
            bobalh(ao|ona) boboca bocal energumeno demente
            canalha cafajeste pilantra crapula safad(o|a|inho|inha|eza) vacil(ao|ona)
            bund(ao|ona)
        `).concat([
            'cal(a|e) (a |essa |sua |tua |)boca',
            'sem vergonha',
        ]),
    },
    {
        category: 'insult',
        severity: 'low',
        ambiguous: true,
        // Bicho, objeto ou adjetivo de uso comum; só vira ofensa dirigido a alguém.
        terms: words(`
            burr(o|a) jument(o|a) anta galinha palhac(o|a) tapad(o|a) lerd(o|a) nojent(o|a)
        `),
    },
    {
        category: 'insult',
        severity: 'medium',
        terms: words(`
            arrombad(o|a) escrot(o|a) desgracad(o|a) corn(o|a|udo|uda) chifrud(o|a)
            cuz(ao|ona) cus(ao|ona)
            vagabund(o|a) vadia tarad(o|a) pervertid(o|a)
            put(a|inha|ona|ao|aria) biscate biscatinha piriguete periguete piranhuda
            quenga rameira meretriz mulherzinha
            fdp vsf vsfd vtnc vtmnc tnc tmnc pnc sfd
        `).concat([
            'filh(o|a|os|as) (da|de uma|duma) (puta|egua|quenga|rapariga)',
            'fi(lho|) d(e|a) rapariga',
            'fela da puta',
            'vai (se|te) (foder|fuder|fode|fude)',
            '(vai |va |)tomar no (seu |teu |meio do |olho do |)(cu|rabo|toba)',
            'toma no (seu |teu |meio do |olho do |)(cu|rabo|toba)',
            'enfia(r|) (isso |)no (seu |teu |)(cu|rabo)',
            'pau no (seu |teu |)cu',
            '(vai|va) (a|pra|para a|na|pra a) (merda|puta que pariu)',
            '(vai|va) (pro|para o) (inferno|caralho)',
            '(vai|va) (cagar|se foder|se fuder)',
            '(vai|va) chupar (um |uma |)(prego|rola|pica|pau|caralho)',
            'mal (comida|amada)',
            'lixo human(o|a)',
        ]),
    },
    {
        category: 'insult',
        severity: 'medium',
        ambiguous: true,
        terms: words(`
            vaca piranha cadela porc(o|a) verme lixo rapariga prostituta
        `),
    },
];
