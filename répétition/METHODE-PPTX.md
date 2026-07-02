# Méthode — générer un PowerPoint (.pptx) natif depuis un dossier de répétition

> But : produire un **.pptx éditable dans PowerPoint** (pas un export d'images) pour n'importe quel dossier `répétition/<slug>/`, avec **peu de texte à l'écran** et **tout le texte parlé dans les notes du présentateur**.
>
> Script : `répétition/_build_pptx.py` · Lib : `python-pptx`.
> **Commande à retenir :**
> ```bash
> python répétition/_build_pptx.py <slug-du-sujet>
> ```
> Exemple : `python répétition/_build_pptx.py cybersecurite-ia-si-resilient`
> → écrit `répétition/<slug>/<slug>.pptx` (13 slides).

---

## 1. Quand l'utiliser

- Un dossier de répétition existe déjà (`00-plan.md`, `slides/`, `assets/charts/*.png`, `assets/img/*`).
- On veut un **PowerPoint prêt à ouvrir / éditer** (école, jury, partage), en plus du deck HTML.
- À tout moment : « génère-moi le pptx » → lancer la commande ci-dessus.

## 2. Prérequis (une seule fois)

```bash
python -m pip install python-pptx pillow
```

- **python-pptx** : construit le .pptx (formes, texte, images, tableaux, **notes**).
- **Pillow (PIL)** : lit les dimensions des images pour les recadrer proprement (logos, photos).
- **PowerPoint** (facultatif) : uniquement pour *vérifier* le rendu en exportant des PNG (voir §7). La génération n'en a pas besoin.

## 3. Principe de conception (les règles non négociables)

1. **Peu de texte à l'écran.** Une slide = un appui visuel : mots-clés, chiffres, tags courts. Pas de phrases. Les explications parenthétiques et le raisonnement vont **dans les notes**.
2. **Tout le texte parlé va dans les notes du présentateur.** On reprend les « Notes orales » de chaque `slides/0X-*.md`, en texte brut. C'est ce que Karim lit/récite ; le jury ne les voit pas.
3. **Thème clair** (fond blanc, texte bleu-nuit, accents colorés). Raison : les PNG des graphiques sont générés **sur fond blanc** → ils s'intègrent sans halo ni carré blanc, et leur texte foncé reste lisible. (Un thème sombre exigerait des graphiques à texte clair — voir §8.)
4. **Format 16:9** (13,333 × 7,5 pouces).
5. **Police Segoe UI** (native Windows, rendu propre garanti ; proche d'Inter).
6. **Aucune source inventée** : le pptx ne fait que reprendre les contenus déjà vérifiés du dossier.

### Palette (thème clair)

| Rôle | Hex | Usage |
|---|---|---|
| Fond | `FFFFFF` | slide |
| Titre | `0F172A` (INK) | titres, mots forts |
| Corps | `334155` (BODY) | texte courant |
| Discret | `64748B` (MUTE) | légendes, sources, n° de slide |
| Bleu | `2563EB` | accent principal, Partie I |
| Ambre | `B45309` | accent secondaire, Partie III |
| Rouge | `DC2626` | menace, Partie II |
| Vert | `059669` | positif / juridique |
| Cartes | `F8FAFC` / `F1F5F9` | fonds de tuiles |
| Bordure | `CBD5E1` | contours |

## 4. Anatomie d'une slide (le gabarit)

Chaque slide suit le même squelette, produit par des fonctions-outils du script :

- **`slide()`** — nouvelle slide fond blanc + fine barre d'accent bleue en haut.
- **`head(s, "05", "eyebrow", [runs de titre])`** — numéro « 05 / 13 » (haut-droite), sur-titre bleu majuscule, titre.
- **contenu** — puces (`bullet_list`), tuiles/cartes (`rrect` + `tbox`), tableaux maison, images.
- **graphique** — `picture_fit(...)` (ajuste à une largeur) ou `picture_cover(...)` (remplit une boîte en rognant, comme `object-fit:cover`).
- **logos** — `logos(s, [chemins])` : chips blanches en haut-droite (institutions citées).
- **`source(s, "…")`** — filet + ligne « Sources : … » en pied de page.
- **`notes(s, "…")`** — **le texte parlé** (obligatoire sur chaque slide).

### Exemple minimal

```python
s = slide()
head(s, "05", "Partie I · La cyberdéfense augmentée",
     [("L'IA, ", INK, True, False), ("bouclier", BLUE, True, False)])
_, tf = tbox(s, 0.55, 2.0, 6.1, 4.5)
bullet_list(tf, [
    [("− 1,9 M$", GREEN, True, False), (" par violation · détection 80 j plus vite", BODY, False, False)],
    [("Marché IA-cyber : 26 → 86 Md$", AMBER, True, False)],
], size=16)
picture_fit(s, os.path.join(CH, "chart-02-cout-violation-ibm.png"), 6.95, 2.75, 5.85)
source(s, "IBM Cost of a Data Breach 2025 · Gartner / MarketsandMarkets.")
notes(s, "Je commence par le côté lumineux… (tout le texte parlé, tiré du .md)")
```

> **Format des « runs ».** Un run = `(texte, couleur, gras, italique)`. Une puce/paragraphe est une **liste de runs** → permet de mettre un chiffre en couleur+gras au milieu d'une phrase noire.
> Positions en **pouces** : `l, t, w, h` (largeur totale 13,333 ; hauteur 7,5).

## 5. Où le script prend son contenu

| Élément du pptx | Source dans le dossier |
|---|---|
| Titre / sur-titre / puces | `slides/0X-*.md` → section **Contenu visible** (résumé en mots-clés) |
| **Notes du présentateur** | `slides/0X-*.md` → section **Notes orales** (texte brut) |
| Graphiques | `assets/charts/chart-0X-*.png` |
| Logos / photos | `assets/img/*.png` / `*.jpg` |
| Pied « Sources » | section **Sources** de la slide / `sources.md` |

Le contenu est **codé en dur** dans `_build_pptx.py` (une section par slide, clairement délimitée par `# SLIDE 0X`). C'est volontaire : on garde le contrôle total de la mise en page et de l'allègement du texte (un parseur Markdown recopierait trop de texte à l'écran).

## 6. Générer

```bash
python répétition/_build_pptx.py <slug>
```

Sortie attendue : `OK -> …\<slug>\<slug>.pptx`. Ouvrir le fichier dans PowerPoint : le volet **Notes** (en bas) contient le texte à dire.

## 7. Vérifier le rendu (facultatif mais recommandé)

PowerPoint permet d'exporter les slides en PNG pour contrôler visuellement (débordements, images, logos). Via PowerShell (COM) :

```powershell
$pp = New-Object -ComObject PowerPoint.Application
$deck = "…\<slug>\<slug>.pptx"
$out  = "…\preview"; New-Item -ItemType Directory -Force $out | Out-Null
$pres = $pp.Presentations.Open($deck, $true, $false, $false)
$pres.SaveAs($out, 18)          # 18 = ppSaveAsPNG (toutes les slides)
# ou une seule : $pres.Slides.Item(6).Export("$out\s06.png","PNG",1280,720)
$pres.Close(); $pp.Quit()
```

Vérifier surtout : **images non déformées / non débordantes** (utiliser `picture_cover` pour les photos), **logos lisibles** (chips blanches), **pas de texte coupé**.

Contrôler que les notes sont bien là :

```python
from pptx import Presentation
p = Presentation("répétition/<slug>/<slug>.pptx")
for i, s in enumerate(p.slides, 1):
    print(i, len(s.notes_slide.notes_text_frame.text), "car.")
```

## 8. Adapter à un nouveau sujet

1. Générer d'abord le dossier avec `/grand-oral` (plan, slides, charts PNG, images).
2. Dans `_build_pptx.py`, **dupliquer le bloc d'un sujet** et réécrire chaque section `# SLIDE 0X` :
   - garder les **helpers** (haut du fichier) tels quels ;
   - remplir le **contenu visible** en mots-clés, les **notes** avec le texte parlé du `.md` ;
   - pointer les bons noms de fichiers dans `assets/charts` et `assets/img`.
3. Le script prend le **slug en argument** (`SLUG = sys.argv[1]`), donc pas de chemin à modifier ailleurs.
4. Lancer, vérifier (§7), ajuster les positions si besoin.

> **Variante thème sombre.** Si on veut un pptx sombre (identité du deck HTML), il faut d'abord **régénérer les SVG des graphiques avec un texte clair** (sinon le texte foncé devient illisible), puis inverser la palette du script (`WHITE→#0F172A`, `INK→#F1F5F9`, etc.). Par défaut on reste en **thème clair** car il réutilise les PNG existants sans retouche.

## 9. Pièges connus

- **Photos déformées / qui débordent** : `add_picture(width=…)` scale proportionnellement (pas de recadrage). Pour remplir une boîte fixe sans déformer, utiliser **`picture_cover(s, path, l, t, w, h)`** (rogne comme `object-fit:cover`).
- **Logos à fond blanc sur fond sombre** : les mettre dans une **chip blanche** (`logos()` le fait déjà).
- **Trop de texte** : si une puce dépasse 6–8 mots, la couper → l'explication va **dans les notes**.
- **Émojis** : rendus en couleur par PowerPoint (ok en titres de section) ; ne pas en abuser.
- **Accents / « » / — / ⟷** : OK en UTF-8, garder l'entête `# -*- coding: utf-8 -*-`.

## 10. Récapitulatif « à la demande »

> « Génère le pptx » →
> ```bash
> python répétition/_build_pptx.py <slug>
> ```
> Résultat : `répétition/<slug>/<slug>.pptx` — 13 slides thème clair, texte allégé, **notes du présentateur complètes**, graphiques et logos intégrés. Ouvrir dans PowerPoint et présenter (volet Notes visible en mode Présentateur).
