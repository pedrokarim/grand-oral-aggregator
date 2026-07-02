# Grand Oral — Plan de soutenance

> **Sujet (blanc)** : Cybersécurité et IA, l'avenir d'un SI résilient
> **Domaine** : INFO · **Thème** : Cybersécurité
> **Auteur** : Karim — Master Informatique CESI
> **Filière** : Manager le SI
> **Format** : 25 min de soutenance (dont 5 min projet professionnel, gérées hors deck) + 20 min de questions (1-2 en répétition)
> **Cible de propos** : ~18 min de contenu sujet + 5 min projet pro

---

## Problématique retenue

> **« Comment le manager du SI peut-il faire de l'intelligence artificielle un levier de résilience — plutôt qu'un nouveau facteur de risque — sur les plans technique, organisationnel et juridique ? »**

Angle : **équilibré, point de vue manager du SI**. On ne diabolise pas l'IA et on ne la survend pas : on montre d'abord la **valeur défensive** (bouclier), puis la **menace symétrique** (arme + nouvelle surface d'attaque), et enfin les **leviers de résilience** qui font l'arbitrage. La problématique annonce explicitement les 3 plans — chacun est réellement délivré (Partie III), pas seulement nommé.

---

## Fil directeur : « l'épée à double tranchant »

La **même** technologie (le machine learning) sert le défenseur ET l'attaquant. La cybersécurité devient une **course symétrique** : le vrai différenciateur n'est plus l'outil, mais la **résilience** — la capacité à encaisser, se rétablir, continuer. On passe de « empêcher l'attaque » (sécurité) à « survivre à l'attaque » (résilience). Notion normée par le **NIST CSF 2.0** (Govern-Identify-Protect-Detect-Respond-Recover) et le règlement **DORA**.

---

## Découpage en 13 slides (~1 min 20 / slide en moyenne)

| # | Titre | Temps | Rôle |
|---|---|---|---|
| 01 | Titre | 0:10 | Identification |
| 02 | **Problématique & plan** | 1:00 | Annoncer la structure (AVANT l'accroche — retour jury) |
| 03 | Accroche | 1:00 | 3 chiffres choc : bouclier / arme / réalité France |
| 04 | Définitions clés | 1:30 | Cybersécurité (triade CIA), IA défensive, résilience |
| 05 | **I.** L'IA, bouclier : la cyberdéfense augmentée | 1:30 | Marché, IBM, SIEM/SOAR/UEBA/XDR |
| 06 | La bascule : l'IA change de camp | 1:15 | Transition : outil neutre, symétrie défense/attaque |
| 07 | **II.** L'IA, arme + IA vulnérable | 2:00 | Phishing IA, deepfakes (Arup), empoisonnement, OWASP LLM |
| 08 | Panorama chiffré de la menace 2025 | 2:00 | Slide la plus dense — ANSSI + ENISA (chiffres / usages séparés) |
| 09 | **III.** Bâtir la résilience — le cadre réglementaire | 1:45 | NIS2 + DORA : la résilience devient une obligation |
| 10 | Sécuriser l'IA elle-même — AI Act & RGPD | 1:30 | Art. 15 AI Act (robustesse+cyber) relié aux attaques · RGPD art. 32 |
| 11 | Leviers : techniques · organisationnels · juridiques | 2:00 | 3 familles concrètes (Zero Trust, gouvernance, conformité) |
| 12 | Conclusion & ouverture | 1:00 | « Assume the breach » = arbitrage permanent |
| 13 | Sources | 0:10 | Bibliographie projetée |

**Total cible** : ~17-18 min → marge confortable sur les 20 min disponibles pour le sujet.

---

## Chiffres-pilier à mémoriser parfaitement

| Chiffre | Donnée | Source |
|---|---|---|
| **4,44 M$** | coût moyen mondial d'une violation en 2025 (−9 %) | IBM Cost of a Data Breach 2025 |
| **−1,9 M$** | économie par violation avec IA + automatisation étendues (3,62 vs 5,52 M$) ; détection **80+ jours** plus vite | IBM 2025 |
| **80 %+** | des e-mails de phishing utilisent l'IA (sept. 2024 – fév. 2025) | ENISA Threat Landscape 2025 |
| **25,6 M$** | fraude au deepfake (faux DAF en visio) — cabinet Arup, Hong Kong, 2024 | CNN / Fortune / CFO Dive |
| **1 366 / 128** | incidents traités / rançongiciels majeurs en France en 2025 ; **48 %** de PME | ANSSI Panorama 2025 |
| **90 %** | des entreprises sans cadre public de gouvernance de l'IA | Thomson Reuters Foundation / UNESCO |
| **10 M€ ou 2 % CA** | sanction max NIS2 ; notification ANSSI **24 h / 72 h / 30 j** | Directive NIS2 |
| **11,7 M** | comptes ANTS exposés (faille IDOR) — avril 2026 | La Dépêche (B. Robert) |

**Règle de scène** : pas plus de 2 chiffres par slide en projection ; tout le reste va dans les notes orales. Pour chaque chiffre énoncé, la source doit être prête en bouche.

---

## Cohérence problématique ↔ plan (garde-fou jury)

- **Technique** → Partie I (défense IA), Partie II (attaques), slide 11 col. 1
- **Organisationnel** → Partie III (gouvernance, RSSI/DPO, AIPD, formation, culture de crise), slide 11 col. 2 — **réellement délivré, pas seulement nommé**
- **Juridique** → slides 09-10 (NIS2, DORA, AI Act, RGPD), slide 11 col. 3

---

## Stratégie pour le jury

- **Poser la valeur AVANT la menace** (ton équilibré, retour jury 28/05) : Partie I est délibérément positive.
- **Nommer les technologies réelles** à chaque partie (SIEM, SOAR, XDR, UEBA, Zero Trust, EBIOS RM, MLSecOps, OWASP LLM, MITRE ATLAS) — posture technique attendue par le Lead Tech.
- **Séparer chiffres et usages** en slide 08 (deux blocs distincts).
- **Relier l'AI Act aux usages** : l'article 15 (robustesse + cybersécurité) répond directement à l'empoisonnement et aux exemples adverses de la Partie II.
- **Transitions explicites** entre chaque partie (voir notes orales des slides 06, 08→09, 10→11).

---

## Avancement

- [x] Plan validé
- [x] Slides 01-13 rédigées en MD
- [x] Sources centralisées dans `sources.md`
- [x] Questions probables du jury dans `questions-jury.md`
- [x] Charts SVG + PNG générés
- [x] Version HTML `slides.html`
- [ ] Chronométrage à blanc à effectuer
