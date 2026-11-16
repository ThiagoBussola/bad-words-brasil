import { LexiconGroup, words } from './group';

/**
 * Vocabulário sexual explícito.
 *
 * Termos de anatomia e de clínica ("pênis", "vagina", "masturbação",
 * "vaginismo", "estupro") ficam de fora de propósito: são palavras que uma
 * pessoa precisa conseguir dizer a um profissional de saúde.
 */
export const sexual: LexiconGroup[] = [
    {
        category: 'sexual',
        severity: 'medium',
        terms: words(`
            bucet(a|inha|ao|ona|uda) bocet(a|inha|ao|uda) busset(a|inha) bct
            xoxot(a|inha|ao) xot(a|inha) xerec(a|ao) xexeca xan(a|inha) xavasca chavasca
            pepeka pepeca ppk prexeca pexereca tcheca
            piroc(a|ao|ona|udo|uda) piroquinha pauz(ao|udo) pirocada jeba benga bilau pint(ao|udo)
            cuz(inho|inha) rabud(a|o) bundud(a|o) rab(ao|ona)
            peit(ao|uda|udas) tet(a|inha|ona|uda) grel(o|inho|uda)
            culh(ao|oes) colh(ao|oes)
            boquet(e|eira|eiro|era|ero) punhet(a|eiro|eira|ao) siririca bronha
            goz(ada|adinha) esporr(a|ada|ar|ei|ou)
            trep(ar|ada|ando|ei|ou) enrab(ar|ada|ado|ou) encox(ar|ada|ando) fornic(ar|ada|ando)
            suruba orgia menage
            tes(ao|uda|udo) tez(ao|uda|udo) gostos(ona|ao|inha|inho) gostozud(a|o)
            ninfeta
        `).concat([
            'pau duro',
            'de quatro pra mim',
            'tomar no cuzinho',
        ]),
    },
    {
        category: 'sexual',
        severity: 'medium',
        ambiguous: true,
        // Têm sentido comum fora do sexo (objeto, bicho, verbo do dia a dia).
        terms: words(`
            pau pica rola pinto piru rabo raba
            perereca periquita
            chup(a|ar|ada|ando|ou|ei|ador|adora|eta|etinha) mamada
            goz(ar|o|a|ei|ou|ando)
            pelad(a|o|inha|inho)
            metendo
        `),
    },
    {
        category: 'sexual',
        severity: 'low',
        ambiguous: true,
        // Sexuais, mas não ofensivos: assunto fora de lugar, não xingamento.
        terms: words(`
            bunda peitos trans(a|ar|ando|ei|ou) sacanagem nude nudes
        `),
    },
];
