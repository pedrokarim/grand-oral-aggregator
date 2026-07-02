# Méthode — injecter un deck sujet DANS la template CESI (en gardant la DA)

> **But** : à partir d'un dossier de répétition (`répétition/<slug>/`) et de la template
> `Template Grand Oral - CESI 2026.pptx`, produire un `.pptx` où **les 13 slides du sujet**
> sont dans la **charte (DA) de la template**, en **variant les types de slides**, et où
> **les slides d'exemple/démo sont supprimées** mais le **vrai projet pro est conservé**.
>
> **Script** : `répétition/_inject_template.py` · **Lib** : `python-pptx` + `Pillow`.
> **Commande** :
> ```bash
> python répétition/_inject_template.py
> ```
> → écrit `répétition/<slug>/<slug>-CESI.pptx`.

Cette méthode complète l'autre (`METHODE-PPTX.md`, qui fabrique un pptx thème clair *from scratch*). Ici on **part de la template CESI** pour hériter de sa DA.

---

## 0. Idée générale (à retenir)

1. **On n'impose pas notre design.** On **réutilise les layouts** de la template : ce sont eux qui portent la DA (fond, barre navy, croix, arcs menthe, grilles de points, police, puces colorées). `add_slide(layout)` fait hériter tout ça automatiquement.
2. **On varie les types de slides** → déco différente à chaque slide. Ne **jamais** mettre le même layout partout.
3. **On remplit les placeholders natifs** (titre, corps, colonnes) → on récupère les **puces de la charte**. On force juste la **taille de police** et la **géométrie** (les auto-styles de la template sont surdimensionnés).
4. **Graphiques / photos / logos / cartes** = ajoutés **en libre** (par-dessus), dans les zones vides.
5. **Notes du présentateur** sur chaque slide sujet.
6. **On supprime les slides démo** de la template, **on garde le titre + le vrai projet pro**.

---

## 1. Prérequis (une fois)

```bash
python -m pip install python-pptx pillow
```
- **python-pptx** : lit/écrit le pptx (slides, placeholders, formes, images, notes).
- **Pillow** : dimensions des images (recadrage propre).
- **PowerPoint** (Windows) : facultatif, seulement pour *vérifier* le rendu (export PNG via COM, §8).

---

## 2. Étape A — Inspecter la template (obligatoire au 1er usage / si la template change)

### A.1 Lister les layouts et leurs placeholders
```python
from pptx import Presentation
p = Presentation("répétition/Template Grand Oral - CESI 2026.pptx")
print(p.slide_width/914400, "x", p.slide_height/914400, "in")   # 10 x 5.625 (16:9)
for i, l in enumerate(p.slide_layouts):
    phs = [(ph.placeholder_format.idx, str(ph.placeholder_format.type), ph.name) for ph in l.placeholders]
    print(i, l.name, phs)
```

### A.2 Voir la DÉCO de chaque layout (le point clé)
Créer une slide par layout, exporter en PNG (via PowerPoint COM, §8) et **regarder** :
```python
for i, l in enumerate(p.slide_layouts):
    s = p.slides.add_slide(l)
    for ph in s.placeholders:
        if ph.placeholder_format.idx == 0:
            ph.text = f"[{i}] {l.name}"; break
p.save("scratch/all_layouts.pptx")
```

### A.3 Voir les slides existantes (pour repérer démo vs vrai projet pro)
```python
for i, s in enumerate(p.slides, 1):
    t = next((sh.text_frame.text for sh in s.shapes if sh.has_text_frame and sh.text_frame.text.strip()), "")
    print(i, s.slide_layout.name, "|", t[:50])
```

---

## 3. La DA de la template CESI (référence)

- **Format** : 10 × 5,625 pouces (16:9). ⚠️ Toutes les positions sont dans **ce** repère (pas 13,33×7,5).
- **Couleurs (thème)** : `LIGHT_1` = blanc, `ACCENT_1` = **menthe**, `DARK_1` = **bleu-nuit**. Fond blanc.
- **Couleurs qu'on réutilise** (proches de la DA, pour nos cartes/emphases) :
  `NAVY 1B1B4B` · `TEAL 0E9F6E` · `BLUE 3B4CE0` · `RED C03939` · `MUTE 64748B` · cartes `F4F6FB`/bord `D5DAE8` · fond menthe clair `E7F7EF`.
- **Police** : `Poppins` (géométrique arrondie ; PowerPoint substitue si absente).
- **Déco** (héritée du layout) : barre d'angle navy en haut, croix (X), arcs menthe, grilles de points bleus, lignes courbes, logos CESI/WD29 (sur le titre).

---

## 4. ⚠️ Layouts DÉCORÉS vs VIDES (règle capitale)

Certains layouts sont **quasi blancs** (aucune déco) → **à éviter** pour du contenu, sinon « le style se barre » :

| ✅ DÉCORÉS (à utiliser) | ❌ VIDES (fond blanc nu) |
|---|---|
| `TITLE` (titre) | `SECTION_HEADER` |
| `SECTION_TITLE_AND_DESCRIPTION` (centré) | `MAIN_POINT` |
| `TITLE_AND_BODY` | `CAPTION_ONLY` |
| `TITLE_AND_TWO_COLUMNS` | `BIG_NUMBER` |
| `TITLE_ONLY` | |
| `ONE_COLUMN_TEXT` | |

> Règle : n'utiliser **que la colonne de gauche**. Si on veut un « gros chiffre » ou un « point fort », on le fait **soi-même** (texte custom) sur un layout **décoré** (ex. `TITLE_ONLY`), pas sur `BIG_NUMBER`/`MAIN_POINT`.

---

## 5. Étape B — Mapping des 13 slides sujet → layouts variés

Objectif : **8 types différents**, aucun **layout identique sur deux slides consécutives**, tous **décorés**.

| # | Slide sujet | Layout | Contenu |
|---|---|---|---|
| 01 | Titre | `TITLE` (slide existante, remplie) | titre blanc + menthe |
| 02 | Problématique & plan | `SECTION_TITLE_AND_DESCRIPTION` | titre + question (centré) |
| 03 | Accroche 3 chiffres | `TITLE_ONLY` + 3 cartes custom | gros chiffres |
| 04 | Définitions | `TITLE_AND_TWO_COLUMNS` (natif) | 2 colonnes à puces |
| 05 | Bouclier + graphe | `ONE_COLUMN_TEXT` | texte natif + chart libre |
| 06 | Bascule + photo | `TITLE_AND_BODY` | corps natif gauche + photo libre |
| 07 | Arme (A/B) | `TITLE_AND_TWO_COLUMNS` (natif) | 2 colonnes |
| 08 | Panorama + graphe | `TITLE_AND_BODY` (géométrie forcée) | puces + chart libre |
| 09 | NIS2 / DORA | `TITLE_AND_TWO_COLUMNS` (natif) | 2 colonnes |
| 10 | AI Act + frise | `TITLE_ONLY` | chart pleine largeur + mini-cartes |
| 11 | Leviers + triangle | `ONE_COLUMN_TEXT` | texte + chart libre |
| 12 | Conclusion | `SECTION_TITLE_AND_DESCRIPTION` | point fort centré + question |
| 13 | Sources | `TITLE_AND_TWO_COLUMNS` (natif) | 2 colonnes |

---

## 6. Étape C — Remplir le NATIF (helpers du script)

- **`title(s, texte, size=22..24, geom=(l,t,w,h))`** — repositionne le placeholder titre (idx 0), texte navy, taille **maîtrisée** (sinon ça déborde).
- **`fill(ph, paras, size, geom, align)`** — vide le placeholder puis ajoute des paragraphes ⇒ **puces natives de la charte**. `paras` = liste de paragraphes, chaque paragraphe = liste de runs `(texte, couleur|None, gras)` (couleur `None` = navy natif ; sinon TEAL/BLUE/RED pour l'emphase).
- **Accès placeholder** : `P(s, idx)` (par `placeholder_format.idx`). Colonnes de `TITLE_AND_TWO_COLUMNS` : idx **1** et **2**. Corps de `TITLE_AND_BODY` : idx **1**. Sous-titre `SECTION.../ONE_COLUMN` : idx **1**.

> **Toujours forcer la géométrie** des placeholders de corps (`geom=`). Les défauts de la template sont fantaisistes.

### Éléments ajoutés en libre (par-dessus la déco)
- **`pic(s, path, l, t, w)`** — image à largeur fixe (garde le ratio) → graphiques.
- **`pic_cover(s, path, l, t, w, h)`** — remplit une boîte en **rognant** (comme `object-fit:cover`) → photos.
- **`logos(s, [fichiers])`** — logos institutionnels en **chips blanches** (haut-droite).
- **`rrect(...)`** — cartes/tuiles arrondies (fond `CARD`, bord `BORD`).
- **`srcnote(s, texte)`** — ligne « Sources : … » en pied.
- **`notes(s, texte)`** — **notes du présentateur** (le texte parlé, tiré des `slides/0X-*.md`).

---

## 7. ⚠️ Pièges rencontrés (et solutions)

1. **Titre géant qui déborde / chevauche** → `title()` force **taille + géométrie**. Ne jamais laisser l'auto-style.
2. **`TITLE_AND_BODY` : corps en colonne d'1 lettre** (largeur qui s'effondre) → **forcer `geom`** (ex. `(0.6,1.55,4.4,3.2)`).
3. **`CAPTION_ONLY` / `ONE_COLUMN_TEXT` : placeholder image plein écran (ou carré)** qui recouvre tout → **ne pas** l'utiliser. Le **retirer** (`ph._element.getparent().remove(ph._element)`) et poser la photo/chart en **libre** (`pic`/`pic_cover`). Idéalement : layout **décoré** + image libre.
4. **Layout « vide »** (`BIG_NUMBER`/`CAPTION_ONLY`/`MAIN_POINT`) → la DA disparaît. **Remplacer par un layout décoré** (voir §4) et faire le gros chiffre / point fort **soi-même**.
5. **`Duplicate name slideXX.xml` à la sauvegarde** → toujours **ajouter les nouvelles slides AVANT de supprimer** (sinon collision de noms de parties).
6. **`PermissionError` à la sauvegarde** → le pptx est **ouvert dans PowerPoint**. Le fermer :
   `Get-Process POWERPNT | Stop-Process -Force` puis relancer.

---

## 8. Étape D — Supprimer les démos, GARDER le vrai projet pro

C'est le point sensible. Dans la template CESI 2026, les slides d'origine (index 0-based) :

| idx | Slide | Action |
|---|---|---|
| 0 | Titre | **GARDER** (on la remplit) |
| 1-3 | Intro générique du sujet (Titre Générique, section, Problématique) | **SUPPRIMER** (on rebâtit) |
| 4-9 | **Démo projet MBFit** (Titre générique, Étapes clés, Déroulement, Bilan projet, Expo Universal, REX) | **SUPPRIMER** |
| 10-15 | **VRAI projet pro** (Projet professionnel, Parcours, Compétences, Métier visé, Projection, Merci) | **GARDER** (Karim le remplit lui-même) |

> ⚠️ **Toujours revérifier** ces index sur la template en cours (§2.3) — ils changent si Karim modifie la template. Le repère : les démos parlent de **MBFit / T3 stack / Vercel / Expo** ; le vrai projet pro parle de **parcours / compétences / métier visé / projection**.

Mécanique (dans cet ordre) :
```python
# 1) fabriquer les 12 nouvelles slides sujet (elles s'ajoutent à la FIN)
# 2) supprimer les démos (index 1..9), en partant du plus grand
for idx in range(9, 0, -1):
    delete_slide(idx)          # delete_slide fait drop_rel + remove (pas d'orphelin)
# 3) placer les 12 slides sujet juste après le titre, avant le projet pro
move_block_to(12, 1)
```
Helpers :
```python
def delete_slide(index):
    lst = prs.slides._sldIdLst; e = list(lst)[index]
    try: prs.part.drop_rel(e.rId)
    except Exception: pass
    lst.remove(e)

def move_block_to(count, pos):   # déplace les `count` dernières slides à l'index pos
    lst = prs.slides._sldIdLst; mv = list(lst)[-count:]
    for m in mv: lst.remove(m)
    for i, m in enumerate(mv): lst.insert(pos + i, m)
```
Résultat : **titre + 13 slides sujet (12 nouvelles) + 6 slides projet pro** = 19 slides.

---

## 9. Étape E — Générer et vérifier

```bash
python répétition/_inject_template.py           # → <slug>-CESI.pptx
```

**Vérifier le rendu** (PowerPoint COM, export PNG) :
```powershell
$pp = New-Object -ComObject PowerPoint.Application
$pres = $pp.Presentations.Open("…\<slug>-CESI.pptx", $true, $false, $false)
1..($pres.Slides.Count) | % { $pres.Slides.Item($_).Export("…\out\s$_.png","PNG",1200,675) }
$pres.Close(); $pp.Quit()
```
Contrôler slide par slide :
- **déco présente sur TOUTES** les slides (pas de fond blanc nu) ;
- titres non coupés, corps non débordés, **puces de la charte** ;
- graphiques/photos/logos bien placés, photo **recadrée** (pas déformée) ;
- **projet pro intact** (14-19), **démos disparues**.

**Vérifier structure + notes** :
```python
for i, s in enumerate(Presentation("…-CESI.pptx").slides, 1):
    n = len(s.notes_slide.notes_text_frame.text) if s.has_notes_slide else 0
    print(i, n)
```

---

## 10. RECETTE pour le VRAI Grand Oral (nouveau sujet)

1. **Générer le dossier** du nouveau sujet avec `/grand-oral <sujet>` → `répétition/<nouveau-slug>/` (plan, 13 slides `.md` avec **Notes orales**, `assets/charts/*.png`, `assets/img/*`).
2. Dans `_inject_template.py` :
   - changer `SLUG = "<nouveau-slug>"` ;
   - **réécrire le contenu** de chaque bloc `# 0X — …` : titres, textes courts, et surtout les **notes** (copiées des « Notes orales » du `.md`) ;
   - pointer les bons fichiers `assets/charts/*.png` et `assets/img/*` ;
   - garder le **mapping varié** (§5) et les **helpers** ;
   - **revérifier les index** démo/projet-pro (§8) sur la template.
3. **Fermer PowerPoint** s'il est ouvert.
4. `python répétition/_inject_template.py`.
5. **Vérifier** (§9), corriger les positions si besoin (1-2 passes).
6. Ouvrir `<slug>-CESI.pptx` : les 13 slides sont dans la DA, le projet pro suit, **notes en mode Présentateur**.

> **Règles d'or** : layouts **variés + décorés** · remplir le **natif** (puces charte) · **taille/géométrie forcées** · images/logos **en libre** · **notes** partout · **supprimer les démos, garder le vrai projet pro** · **vérifier au rendu**.
