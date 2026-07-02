# Répétitions Grand Oral — index des sujets traités

> Chaque dossier est autonome : plan, 13 slides (MD + notes orales), sources vérifiées, graphiques SVG+PNG, deck HTML et Q&A jury.
> Format CESI Master Info : 25 min de soutenance (dont 5 min projet pro, hors deck) + 20 min de questions.

| Sujet | Dossier | Thème | Angle | Statut |
|---|---|---|---|---|
| **Big Data, surveillance et confiance** | [`big-data-surveillance-confiance/`](big-data-surveillance-confiance/) | Big Data | Problématique équilibrée (moteur → dérive → leviers) | Répété le 28/05/26 (jury) |
| **Cybersécurité et IA, l'avenir d'un SI résilient** | [`cybersecurite-ia-si-resilient/`](cybersecurite-ia-si-resilient/) | Cybersécurité | Manager du SI — l'épée à double tranchant (bouclier / arme / résilience) | Préparé (sujet blanc) |

---

## Ressources transverses

- `aide-memoire-grand-oral.md` — mémo général de préparation.
- `restitution-28-05-26.md` — retours du jury de la 1re répétition (à appliquer à tous les sujets).
- `_convert_svg_to_png.py` — conversion SVG → PNG (3×, fond transparent) via Edge headless.
  Usage : `python répétition/_convert_svg_to_png.py <slug-du-sujet>`
- `_build_pptx.py` — génère un **PowerPoint natif** (thème clair, texte allégé + **notes du présentateur**) depuis un dossier.
  Usage : `python répétition/_build_pptx.py <slug-du-sujet>` → `répétition/<slug>/<slug>.pptx`
- [`METHODE-PPTX.md`](METHODE-PPTX.md) — **méthode complète** pour générer un .pptx *from scratch* (thème clair, texte allégé + notes) à la demande.
- `_inject_template.py` — injecte le deck sujet **DANS la template CESI** (garde la DA, types variés, notes) : `python répétition/_inject_template.py` → `<slug>-CESI.pptx`.
- [`METHODE-TEMPLATE-CESI.md`](METHODE-TEMPLATE-CESI.md) — **méthode point par point** pour injecter un nouveau sujet dans la template CESI le jour J (inspection, layouts décorés vs vides, mapping varié, remplissage natif, pièges, suppression démos / garde projet pro, vérif). ⭐ à suivre pour le vrai Grand Oral.

## Retours jury à garder en tête (28/05/26)

- Problématique + plan **avant** l'accroche.
- Séparer nettement **chiffres** et **usages**.
- **Posture technique** : nommer les vraies technologies.
- Ton **moins négatif** : montrer la valeur avant les dérives.
- Expliciter chaque **sigle** à sa 1re apparition.
- Réglementation **concrète et reliée aux usages**.
- **Transitions** soignées entre parties.
- Problématique sous l'angle **manager du SI** (technique + organisationnel + juridique) — et chaque plan **réellement délivré**.
