# -*- coding: utf-8 -*-
"""
Génère un .pptx natif (thème clair, éditable dans PowerPoint) pour un dossier
de répétition Grand Oral. Texte à l'écran allégé (support visuel) + TOUT le
texte parlé dans les NOTES du présentateur. Réutilise les graphiques/logos PNG.

Usage : python répétition/_build_pptx.py <slug-du-sujet>
Sortie : répétition/<slug>/<slug>.pptx
"""
import os, sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

SLUG = sys.argv[1] if len(sys.argv) > 1 else "cybersecurite-ia-si-resilient"
BASE = os.path.join(os.path.dirname(__file__), SLUG)
CH = os.path.join(BASE, "assets", "charts")
IM = os.path.join(BASE, "assets", "img")

# ---- palette (thème clair) ----
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
INK   = RGBColor(0x0F, 0x17, 0x2A)
BODY  = RGBColor(0x33, 0x41, 0x55)
MUTE  = RGBColor(0x64, 0x74, 0x8B)
BLUE  = RGBColor(0x25, 0x63, 0xEB)
AMBER = RGBColor(0xB4, 0x53, 0x09)
RED   = RGBColor(0xDC, 0x26, 0x26)
GREEN = RGBColor(0x05, 0x96, 0x69)
CARD  = RGBColor(0xF1, 0xF5, 0xF9)
CARDB = RGBColor(0xF8, 0xFA, 0xFC)
BORDER= RGBColor(0xCB, 0xD5, 0xE1)
BLUEBG= RGBColor(0xEF, 0xF6, 0xFF)
AMBBG = RGBColor(0xFF, 0xFB, 0xEB)
GRNBG = RGBColor(0xEC, 0xFD, 0xF5)
FONT  = "Segoe UI"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]
W = 13.333

# ---------- helpers ----------
def slide():
    s = prs.slides.add_slide(BLANK)
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = WHITE
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(W), Inches(0.07))
    bar.fill.solid(); bar.fill.fore_color.rgb = BLUE; bar.line.fill.background(); bar.shadow.inherit = False
    return s

def _set(r, text, size, color, bold=False, italic=False, font=FONT):
    r.text = text; f = r.font
    f.size = Pt(size); f.color.rgb = color; f.bold = bold; f.italic = italic; f.name = font

def tbox(s, l, t, w, h, anchor=None):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = 0; tf.margin_right = 0; tf.margin_top = 0; tf.margin_bottom = 0
    if anchor is not None: tf.vertical_anchor = anchor
    return tb, tf

def runs_para(p, runs, size, align=None, space_after=6, space_before=0, line=None):
    p.space_after = Pt(space_after); p.space_before = Pt(space_before)
    if align is not None: p.alignment = align
    if line is not None: p.line_spacing = line
    for (t, c, b, it) in runs:
        _set(p.add_run(), t, size, c, bold=b, italic=it)

def simple(tf, text, size, color, bold=False, italic=False, align=None, space_after=6, first=True):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    runs_para(p, [(text, color, bold, italic)], size, align=align, space_after=space_after)
    return p

def bullet_list(tf, items, size=15, first_is_para0=True, sa=10, line=1.05, dot=BODY):
    """items: list of run-lists [(text,color,bold,italic),...]"""
    for i, rs in enumerate(items):
        if i == 0 and first_is_para0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.space_after = Pt(sa); p.line_spacing = line
        _set(p.add_run(), "•  ", size, dot)
        for (t, c, b, it) in rs:
            _set(p.add_run(), t, size, c if c else BODY, bold=b, italic=it)

def rrect(s, l, t, w, h, fill, line=None, lw=1.0):
    sp = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    sp.fill.solid(); sp.fill.fore_color.rgb = fill
    if line is not None: sp.line.color.rgb = line; sp.line.width = Pt(lw)
    else: sp.line.fill.background()
    sp.shadow.inherit = False
    try: sp.adjustments[0] = 0.06
    except Exception: pass
    return sp

def head(s, num, eyebrow, title_runs):
    _, tf = tbox(s, 12.35, 0.30, 0.85, 0.3)
    simple(tf, f"{num} / 13", 11, MUTE, bold=True, align=PP_ALIGN.RIGHT)
    _, tf = tbox(s, 0.55, 0.42, 11.3, 0.32)
    simple(tf, eyebrow.upper(), 11, BLUE, bold=True)
    _, tf = tbox(s, 0.55, 0.74, 12.2, 0.95)
    runs_para(tf.paragraphs[0], title_runs, 30, space_after=0, line=1.05)

def source(s, text):
    ln = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.55), Inches(6.92), Inches(12.23), Pt(1))
    ln.fill.solid(); ln.fill.fore_color.rgb = BORDER; ln.line.fill.background(); ln.shadow.inherit = False
    _, tf = tbox(s, 0.55, 7.0, 12.23, 0.4)
    p = tf.paragraphs[0]
    _set(p.add_run(), "Sources : ", 10.5, MUTE, bold=True)
    _set(p.add_run(), text, 10.5, MUTE)

def notes(s, text):
    s.notes_slide.notes_text_frame.text = text

def logos(s, files, x_right=12.05, y=0.66, h=0.42, gap=0.12):
    from PIL import Image
    widths = [h * Image.open(f).size[0] / Image.open(f).size[1] for f in files]
    total = sum(widths) + gap * (len(files) - 1)
    x = x_right - total
    for f, w in zip(files, widths):
        pad = 0.06
        rrect(s, x - pad, y - pad, w + 2*pad, h + 2*pad, WHITE, line=BORDER, lw=0.75)
        s.shapes.add_picture(f, Inches(x), Inches(y), height=Inches(h))
        x += w + gap

def picture_fit(s, path, l, t, w):
    from PIL import Image
    ratio = Image.open(path).size[1] / Image.open(path).size[0]
    return s.shapes.add_picture(path, Inches(l), Inches(t), width=Inches(w), height=Inches(w*ratio))

def picture_cover(s, path, l, t, w, h):
    from PIL import Image
    iw, ih = Image.open(path).size
    img_ar = iw / ih; box_ar = w / h
    pic = s.shapes.add_picture(path, Inches(l), Inches(t), width=Inches(w), height=Inches(h))
    if img_ar > box_ar:
        crop = (1 - box_ar / img_ar) / 2; pic.crop_left = crop; pic.crop_right = crop
    else:
        crop = (1 - img_ar / box_ar) / 2; pic.crop_top = crop; pic.crop_bottom = crop
    return pic

# ======================================================================
# SLIDE 01 — TITRE
# ======================================================================
s = slide()
_, tf = tbox(s, 1.0, 2.35, 11.33, 0.4)
simple(tf, "GRAND ORAL CESI · SUJET BLANC · THÈME CYBERSÉCURITÉ", 13, BLUE, bold=True, align=PP_ALIGN.CENTER)
_, tf = tbox(s, 1.0, 2.8, 11.33, 1.6)
runs_para(tf.paragraphs[0], [("Cybersécurité et IA :", INK, True, False)], 40, align=PP_ALIGN.CENTER, space_after=2, line=1.05)
runs_para(tf.add_paragraph(), [("l'avenir d'un ", INK, True, False), ("SI résilient", AMBER, True, False)], 40, align=PP_ALIGN.CENTER, space_after=0, line=1.05)
_, tf = tbox(s, 1.5, 4.55, 10.33, 0.6)
simple(tf, "Quand la même intelligence artificielle arme le défenseur… et l'attaquant.", 17, MUTE, italic=True, align=PP_ALIGN.CENTER)
_, tf = tbox(s, 1.5, 5.5, 10.33, 0.7)
runs_para(tf.paragraphs[0], [("Karim", INK, True, False), ("  —  Master Informatique CESI · Filière « Manager le SI »", BODY, False, False)], 15, align=PP_ALIGN.CENTER)
notes(s, "Bonjour, je m'appelle Karim, étudiant en Master Informatique au CESI, filière Manager le SI. "
         "Mon sujet : « Cybersécurité et IA, l'avenir d'un SI résilient ». Je l'aborde du point de vue du "
         "manager du SI : exploiter l'IA pour se défendre, anticiper ses usages offensifs, et garantir que "
         "le SI continue de fonctionner même sous attaque.")

# ======================================================================
# SLIDE 02 — PROBLÉMATIQUE & PLAN
# ======================================================================
s = slide()
head(s, "02", "Problématique · Plan en trois temps", [("Le fil rouge de cette soutenance", INK, True, False)])
rrect(s, 0.55, 1.68, 12.23, 1.15, BLUEBG, line=BLUE, lw=1.0)
_, tf = tbox(s, 0.85, 1.85, 11.6, 0.85, anchor=MSO_ANCHOR.MIDDLE)
runs_para(tf.paragraphs[0], [
    ("Faire de l'IA un ", INK, False, True), ("levier de résilience", BLUE, True, True),
    (" plutôt qu'un facteur de risque — sur les plans ", INK, False, True),
    ("technique", BLUE, True, True), (", ", INK, False, True),
    ("organisationnel", AMBER, True, True), (" et ", INK, False, True),
    ("juridique", GREEN, True, True), (".", INK, False, True),
], 18, line=1.15, space_after=0)
cw = 3.87; y = 3.15; ch = 3.1
cards = [
    (0.55, "PARTIE I", BLUE, "L'IA, bouclier", "Cyberdéfense augmentée"),
    (4.73, "PARTIE II", RED, "L'IA, arme", "La menace se réinvente"),
    (8.91, "PARTIE III", AMBER, "Bâtir la résilience", "Technique · gouvernance · droit"),
]
for (x, badge, col, ttl, desc) in cards:
    rrect(s, x, y, cw, ch, CARDB, line=BORDER, lw=1.0)
    _, tf = tbox(s, x+0.3, y, cw-0.6, ch, anchor=MSO_ANCHOR.MIDDLE)
    simple(tf, badge, 12, col, bold=True, space_after=12)
    simple(tf, ttl, 23, INK, bold=True, space_after=12, first=False)
    simple(tf, desc, 15, MUTE, space_after=0, first=False)
source(s, "Angle : manager du SI · volontairement équilibré.")
notes(s, "Avant d'entrer dans le sujet, je pose ma problématique, car c'est elle qui tient tout le fil. "
         "L'IA transforme la cybersécurité, mais des deux côtés à la fois. Ma question : comment le manager "
         "du SI peut-il faire de l'IA un levier de résilience plutôt qu'un facteur de risque, sur trois plans "
         "indissociables — technique, organisationnel et juridique. J'y réponds en trois temps : d'abord le "
         "bouclier, ce que l'IA apporte à la défense ; puis l'épée, la même IA qui arme l'attaquant et devient "
         "une cible ; enfin les leviers pour bâtir un SI résilient. Le mot-clé de ma soutenance : résilience — "
         "on ne peut plus tout empêcher, l'enjeu devient de tenir malgré l'attaque.")

# ======================================================================
# SLIDE 03 — ACCROCHE
# ======================================================================
s = slide()
head(s, "03", "Accroche · Trois faits, une même technologie", [("L'épée à double tranchant", INK, True, False)])
tw = 3.87; y = 2.0; th = 2.5
tiles = [
    (0.55, "− 1,9 M$", GREEN, "l'IA en défense — détection 80 j plus vite"),
    (4.73, "80 %+", RED, "du phishing dopé à l'IA"),
    (8.91, "25,6 M$", RED, "un deepfake de DAF en visio (Arup)"),
]
for (x, num, col, lab) in tiles:
    rrect(s, x, y, tw, th, CARDB, line=BORDER, lw=1.0)
    _, tf = tbox(s, x+0.25, y, tw-0.5, th, anchor=MSO_ANCHOR.MIDDLE)
    simple(tf, num, 46, col, bold=True, align=PP_ALIGN.CENTER, space_after=12)
    simple(tf, lab, 15, BODY, align=PP_ALIGN.CENTER, space_after=0, first=False)
rrect(s, 0.55, 5.05, 12.23, 1.05, AMBBG, line=AMBER, lw=1.0)
_, tf = tbox(s, 0.9, 5.05, 11.5, 1.05, anchor=MSO_ANCHOR.MIDDLE)
runs_para(tf.paragraphs[0], [("La même IA défend et attaque. Le vrai enjeu : la ", INK, False, True),
              ("résilience", AMBER, True, True), (".", INK, False, True)], 19, space_after=0)
source(s, "IBM Cost of a Data Breach 2025 · ENISA 2025 · CNN / Fortune (Arup, 2024).")
notes(s, "Trois faits pour planter le décor. Un : selon IBM, les organisations qui utilisent massivement l'IA "
         "en défense économisent 1,9 million de dollars par violation et détectent 80 jours plus tôt — l'IA "
         "est un vrai bouclier. Deux : selon l'ENISA, plus de 80 % des e-mails de phishing utilisent l'IA — "
         "la même technologie sert l'attaquant. Trois : en 2024, un employé du cabinet Arup a viré 25,6 millions "
         "de dollars après une visioconférence où tous ses interlocuteurs, dont le directeur financier, étaient "
         "des deepfakes générés par IA. Bouclier, arme, illusion parfaite : voilà l'épée à double tranchant. "
         "D'où la vraie question : non plus comment empêcher, mais comment rester debout — la résilience.")

# ======================================================================
# SLIDE 04 — DÉFINITIONS
# ======================================================================
s = slide()
head(s, "04", "Cadrage conceptuel", [("Trois mots, trois définitions", INK, True, False)])
rows = [
    ("Cybersécurité", BLUE, "Protéger Confidentialité · Intégrité · Disponibilité — la triade CIA."),
    ("IA en cybersécurité", RED, "Machine learning : supervisé (le connu) + non supervisé (l'anomalie)."),
    ("SI résilient", GREEN, "Anticiper · résister · se rétablir · s'adapter.  (NIST CSF 2.0)"),
]
y = 1.95; rh = 1.28
for (concept, col, defn) in rows:
    rrect(s, 0.55, y, 3.4, rh, CARD, line=BORDER, lw=1.0)
    _, tf = tbox(s, 0.78, y, 3.0, rh, anchor=MSO_ANCHOR.MIDDLE)
    simple(tf, concept, 17, col, bold=True)
    rrect(s, 4.05, y, 8.73, rh, WHITE, line=BORDER, lw=1.0)
    _, tf = tbox(s, 4.3, y, 8.25, rh, anchor=MSO_ANCHOR.MIDDLE)
    simple(tf, defn, 15, BODY, space_after=0)
    y += rh + 0.2
rrect(s, 0.55, y+0.05, 12.23, 0.86, AMBBG, line=AMBER, lw=1.0)
_, tf = tbox(s, 0.85, y+0.05, 11.6, 0.86, anchor=MSO_ANCHOR.MIDDLE)
runs_para(tf.paragraphs[0], [("Sécurité = empêcher l'attaque.  ", INK, True, False),
              ("Résilience = encaisser et continuer.", AMBER, True, False)], 16, space_after=0)
source(s, "ANSSI / ISO 27000 (triade CIA) · NIST Cybersecurity Framework 2.0, 2024.")
notes(s, "Trois définitions pour parler la même langue que le jury. La cybersécurité, d'abord : ce n'est pas "
         "que de la technique, c'est l'ensemble des moyens techniques, organisationnels et humains qui protègent "
         "trois propriétés — confidentialité, intégrité et disponibilité, la triade CIA, socle des normes ISO 27000 "
         "et de l'ANSSI. L'IA en cybersécurité, ensuite : c'est du machine learning, supervisé pour reconnaître "
         "des menaces connues, non supervisé pour détecter l'anomalie inédite. Enfin, le SI résilient, cœur de "
         "mon sujet : la capacité à anticiper, résister, se rétablir et s'adapter. La nuance est capitale — la "
         "sécurité cherche à empêcher l'attaque, la résilience part du principe qu'une partie passera quoi qu'il "
         "arrive et organise la continuité. C'est la logique du référentiel NIST CSF version 2.")

# ======================================================================
# SLIDE 05 — I. L'IA BOUCLIER
# ======================================================================
s = slide()
head(s, "05", "Partie I · La cyberdéfense augmentée", [("L'IA, ", INK, True, False), ("bouclier", BLUE, True, False), (" : la valeur d'abord", INK, True, False)])
_, tf = tbox(s, 0.55, 2.0, 6.1, 4.5)
bullet_list(tf, [
    [("− 1,9 M$", GREEN, True, False), (" par violation · détection 80 j plus vite", BODY, False, False)],
    [("Marché IA-cyber : 26 → 86 Md$", AMBER, True, False)],
], size=16, sa=12)
simple(tf, "Où l'IA agit dans le SOC", 16, INK, bold=True, first=False, space_after=10)
for rs in [
    [("SIEM + UEBA", BLUE, True, False), (" — détecter l'anomalie", BODY, False, False)],
    [("SOAR", BLUE, True, False), (" — automatiser la réponse", BODY, False, False)],
    [("EDR / XDR", BLUE, True, False), (" — postes · réseau · cloud", BODY, False, False)],
]:
    p = tf.add_paragraph(); p.space_after = Pt(9); p.line_spacing = 1.05
    _set(p.add_run(), "•  ", 15, BODY)
    for (t, c, b, it) in rs: _set(p.add_run(), t, 15, c, bold=b, italic=it)
picture_fit(s, os.path.join(CH, "chart-02-cout-violation-ibm.png"), 6.95, 2.75, 5.85)
source(s, "IBM Cost of a Data Breach 2025 · Gartner / MarketsandMarkets.")
notes(s, "Je commence par le côté lumineux, réel et massif. Le chiffre le plus parlant vient du rapport IBM 2025 : "
         "une organisation qui déploie largement l'IA et l'automatisation en défense paie en moyenne 3,6 millions "
         "de dollars par violation, contre 5,5 pour les autres — 1,9 million d'économie, et surtout une détection "
         "80 jours plus rapide. En cybersécurité, le temps c'est tout. Concrètement, où l'IA agit-elle ? Dans le "
         "SOC, le centre opérationnel de sécurité. Le SIEM collecte les journaux ; couplé à l'UEBA, il apprend le "
         "comportement normal et alerte quand quelqu'un se connecte à 3 h du matin depuis l'étranger et aspire "
         "toute une base. Le SOAR automatise ensuite la réponse. L'IA ne remplace pas l'analyste : elle trie le "
         "déluge d'alertes. C'est un multiplicateur de force — d'où un marché qui passe de 26 à 86 milliards.")

# ======================================================================
# SLIDE 06 — BASCULE
# ======================================================================
s = slide()
head(s, "06", "Transition · L'IA change de camp", [("Un outil n'a pas de ", INK, True, False), ("camp", AMBER, True, False)])
rrect(s, 0.55, 1.72, 12.23, 0.82, CARD, line=None)
_, tf = tbox(s, 0.85, 1.72, 11.6, 0.82, anchor=MSO_ANCHOR.MIDDLE)
runs_para(tf.paragraphs[0], [("DÉFENSE", BLUE, True, False), ("   ⟷   ", MUTE, False, False),
              ("même machine learning", AMBER, True, False), ("   ⟷   ", MUTE, False, False),
              ("ATTAQUE", RED, True, False)], 19, align=PP_ALIGN.CENTER, space_after=0)
tblx = 0.55; tbly = 2.85
pairs = [("Détecter l'anomalie", "Contourner la détection"),
         ("Écrire des règles", "Écrire des phishing parfaits"),
         ("Automatiser la réponse", "Automatiser l'exploitation")]
_, tf = tbox(s, tblx, tbly, 3.0, 0.3); runs_para(tf.paragraphs[0], [("CÔTÉ DÉFENSE", BLUE, True, False)], 11, space_after=0)
_, tf = tbox(s, tblx+3.1, tbly, 3.0, 0.3); runs_para(tf.paragraphs[0], [("CÔTÉ ATTAQUE", RED, True, False)], 11, space_after=0)
yy = tbly + 0.4
for (a, b) in pairs:
    ln = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(tblx), Inches(yy-0.06), Inches(6.0), Pt(1))
    ln.fill.solid(); ln.fill.fore_color.rgb = BORDER; ln.line.fill.background(); ln.shadow.inherit = False
    _, tf = tbox(s, tblx, yy, 3.0, 0.6, anchor=MSO_ANCHOR.MIDDLE); simple(tf, a, 13.5, BODY, space_after=0)
    _, tf = tbox(s, tblx+3.1, yy, 2.95, 0.6, anchor=MSO_ANCHOR.MIDDLE); simple(tf, b, 13.5, BODY, space_after=0)
    yy += 0.66
rrect(s, tblx, yy+0.1, 6.0, 0.7, AMBBG, line=AMBER, lw=1.0)
_, tf = tbox(s, tblx+0.2, yy+0.1, 5.6, 0.7, anchor=MSO_ANCHOR.MIDDLE)
runs_para(tf.paragraphs[0], [("La barrière à l'entrée de la cybercriminalité s'effondre.", INK, True, False)], 14, space_after=0)
rrect(s, 6.95, 2.8, 5.83, 3.75, WHITE, line=BORDER, lw=1.0)
picture_cover(s, os.path.join(IM, "datacenter.jpg"), 7.05, 2.9, 5.63, 2.55)
_, tf = tbox(s, 7.12, 5.55, 5.5, 0.92)
runs_para(tf.paragraphs[0], [("Le SI, au milieu — même infra, deux usages.", INK, True, False)], 12, space_after=2)
runs_para(tf.add_paragraph(), [("Photo : CERN · CC BY-SA 3.0 (Wikimedia Commons)", MUTE, False, True)], 10, space_after=0, line=1.1)
source(s, "Transition : du bouclier à l'épée.")
notes(s, "On vient de voir l'IA comme bouclier. Le problème, c'est qu'un outil n'a pas de camp : le machine "
         "learning qui repère une anomalie pour le défenseur est exactement celui qui apprend à la maquiller "
         "pour l'attaquant. La cybersécurité devient une course symétrique. Et cette symétrie fait s'effondrer "
         "la barrière à l'entrée : avant, monter un phishing crédible demandait du temps et des compétences ; "
         "aujourd'hui, un modèle de langage le fait en quelques secondes, à l'échelle, personnalisé. On n'a plus "
         "besoin d'être expert pour lancer une attaque sophistiquée. C'est le point de bascule : je passe du "
         "bouclier à l'épée.")

# ======================================================================
# SLIDE 07 — II. L'IA ARME + VULNÉRABLE
# ======================================================================
s = slide()
head(s, "07", "Partie II · Le revers, en deux volets", [("L'IA qui ", INK, True, False), ("attaque", RED, True, False), (" — et l'IA qu'on ", INK, True, False), ("attaque", RED, True, False)])
logos(s, [os.path.join(IM, "enisa-logo.png")])
rrect(s, 0.55, 2.0, 5.95, 4.55, CARDB, line=BORDER, lw=1.0)
_, tf = tbox(s, 0.85, 2.3, 5.45, 4.0)
simple(tf, "A · L'IA qui attaque", 17, RED, bold=True, space_after=14)
for rs in [
    [("Phishing IA", INK, True, False), (" — 80 % des e-mails", BODY, False, False)],
    [("WormGPT · FraudGPT", INK, True, False), (" (LLM du crime)", BODY, False, False)],
    [("Deepfakes", INK, True, False), (" → Arup, 25,6 M$", BODY, False, False)],
    [("Reconnaissance & code", INK, True, False)],
]:
    p = tf.add_paragraph(); p.space_after = Pt(12); p.line_spacing = 1.05
    _set(p.add_run(), "•  ", 15, BODY)
    for (t, c, b, it) in rs: _set(p.add_run(), t, 15, c, bold=b, italic=it)
rrect(s, 6.83, 2.0, 5.95, 4.55, CARDB, line=BORDER, lw=1.0)
_, tf = tbox(s, 7.13, 2.3, 5.45, 4.0)
simple(tf, "B · L'IA qu'on attaque", 17, AMBER, bold=True, space_after=14)
for rs in [
    [("Empoisonnement", INK, True, False), (" des données", BODY, False, False)],
    [("Exemples adverses", INK, True, False)],
    [("Injection de prompt", INK, True, False), (" (OWASP LLM01)", BODY, False, False)],
    [("Shadow AI", INK, True, False), (" — + 670 k$ / violation", BODY, False, False)],
]:
    p = tf.add_paragraph(); p.space_after = Pt(12); p.line_spacing = 1.05
    _set(p.add_run(), "•  ", 15, BODY)
    for (t, c, b, it) in rs: _set(p.add_run(), t, 15, c, bold=b, italic=it)
source(s, "ENISA 2025 · CNN / Fortune (Arup) · OWASP Top 10 LLM 2025 · MITRE ATLAS · IBM 2025.")
notes(s, "Le revers a deux volets, et on oublie souvent le second. Volet A, l'IA comme arme : l'ENISA confirme "
         "que plus de 80 % des e-mails de phishing sont désormais rédigés ou personnalisés par IA. Il existe même "
         "des modèles conçus pour le crime, WormGPT ou FraudGPT, vendus sur des forums sans garde-fous. Ajoutez "
         "les deepfakes : c'est le cas Arup, 25,6 millions détournés. Et des services de renseignement utilisent "
         "des IA grand public pour de la reconnaissance et de la génération de code. Volet B, plus subtil : quand "
         "on déploie de l'IA, elle devient elle-même une cible. On peut empoisonner ses données d'entraînement, la "
         "tromper avec des exemples adverses, ou l'injection de prompt — que l'OWASP classe risque numéro 1 pour "
         "les LLM. Sans oublier le shadow AI, 670 000 dollars de surcoût. Autrement dit : sécuriser avec l'IA ne "
         "suffit pas, il faut aussi sécuriser l'IA.")

# ======================================================================
# SLIDE 08 — PANORAMA CHIFFRÉ
# ======================================================================
s = slide()
head(s, "08", "Le cœur du sujet · Panorama de la menace 2025", [("Les chiffres… et, séparément, les ", INK, True, False), ("usages", AMBER, True, False)])
logos(s, [os.path.join(IM, "anssi-logo.jpg")])
_, tf = tbox(s, 0.55, 2.25, 6.0, 4.3)
simple(tf, "📊  Les volumes", 16, BLUE, bold=True, space_after=12)
for rs in [
    [("1 366", INK, True, False), (" incidents ANSSI (France, 2025)", BODY, False, False)],
    [("128", INK, True, False), (" rançongiciels · ", BODY, False, False), ("196", INK, True, False), (" exfiltrations", BODY, False, False)],
    [("4 875", INK, True, False), (" incidents analysés (ENISA)", BODY, False, False)],
]:
    p = tf.add_paragraph(); p.space_after = Pt(10); p.line_spacing = 1.05
    _set(p.add_run(), "•  ", 15.5, BODY)
    for (t, c, b, it) in rs: _set(p.add_run(), t, 15.5, c, bold=b, italic=it)
p = tf.add_paragraph(); p.space_before = Pt(12)
runs_para(p, [("🎯  Les usages structurants", RED, True, False)], 16, space_after=12)
for rs in [
    [("80 %+", INK, True, False), (" du phishing dopé à l'IA", BODY, False, False)],
    [("48 %", INK, True, False), (" des victimes = PME / TPE / ETI", BODY, False, False)],
    [("Brouillage", INK, True, False), (" États ⟷ cybercriminels", BODY, False, False)],
]:
    p = tf.add_paragraph(); p.space_after = Pt(10); p.line_spacing = 1.05
    _set(p.add_run(), "•  ", 15.5, BODY)
    for (t, c, b, it) in rs: _set(p.add_run(), t, 15.5, c, bold=b, italic=it)
picture_fit(s, os.path.join(CH, "chart-03-menace-secteurs.png"), 6.95, 2.5, 5.85)
source(s, "ANSSI — Panorama de la cybermenace 2025 · ENISA — Threat Landscape 2025.")
notes(s, "Cette slide est la plus dense, je la lis en deux temps distincts. Les volumes d'abord : en France, "
         "l'ANSSI a traité 1 366 incidents en 2025, dont 128 rançongiciels majeurs et 196 exfiltrations ; à "
         "l'échelle européenne, l'ENISA en a analysé 4 875 sur un an. La menace est de masse, permanente. Les "
         "usages ensuite — c'est là que l'IA change la donne : plus de 80 % du phishing est dopé à l'IA, "
         "l'ingénierie sociale est industrialisée ; et la cible se démocratise, 48 % des victimes de rançongiciel "
         "sont des PME, TPE, ETI, plus seulement les grands groupes. Les secteurs les plus touchés : "
         "éducation-recherche un tiers, collectivités un quart, puis la santé. Enfin, l'ANSSI note un brouillage "
         "entre États et cybercriminels : la frontière géopolitique s'efface.")

# ======================================================================
# SLIDE 09 — III. NIS2 / DORA
# ======================================================================
s = slide()
head(s, "09", "Partie III · La résilience devient une obligation", [("Bâtir la résilience — le ", INK, True, False), ("cadre réglementaire", BLUE, True, False)])
logos(s, [os.path.join(IM, "eu-flag.png")])
rrect(s, 0.55, 2.0, 5.95, 3.3, BLUEBG, line=BLUE, lw=1.0)
_, tf = tbox(s, 0.85, 2.28, 5.45, 2.9)
simple(tf, "NIS2 — tout l'écosystème", 16, BLUE, bold=True, space_after=12)
for rs in [
    [("Entités essentielles & importantes", INK, True, False)],
    [("Mesures techniques + organisationnelles", INK, True, False)],
    [("Notification 24 h / 72 h / 30 j", INK, True, False)],
    [("10 M€ / 2 % CA · dirigeants responsables", INK, True, False)],
]:
    p = tf.add_paragraph(); p.space_after = Pt(11); p.line_spacing = 1.05
    _set(p.add_run(), "•  ", 14.5, BODY)
    for (t, c, b, it) in rs: _set(p.add_run(), t, 14.5, c, bold=b, italic=it)
rrect(s, 6.83, 2.0, 5.95, 3.3, GRNBG, line=GREEN, lw=1.0)
_, tf = tbox(s, 7.13, 2.28, 5.45, 2.9)
simple(tf, "DORA — la finance", 16, GREEN, bold=True, space_after=12)
for rs in [
    [("Depuis le 17/01/2025 · > 22 000 entités", INK, True, False)],
    [("Tests de résilience obligatoires", INK, True, False)],
    [("Supervision des prestataires TIC", INK, True, False)],
    [("Incident majeur notifié en 4 h", INK, True, False)],
]:
    p = tf.add_paragraph(); p.space_after = Pt(11); p.line_spacing = 1.05
    _set(p.add_run(), "•  ", 14.5, BODY)
    for (t, c, b, it) in rs: _set(p.add_run(), t, 14.5, c, bold=b, italic=it)
rrect(s, 0.55, 5.55, 12.23, 1.0, AMBBG, line=AMBER, lw=1.0)
_, tf = tbox(s, 0.85, 5.55, 11.6, 1.0, anchor=MSO_ANCHOR.MIDDLE)
runs_para(tf.paragraphs[0], [("On n'exige plus seulement d'", INK, False, True), ("empêcher", INK, True, True),
              (", mais de pouvoir ", INK, False, True), ("encaisser et se rétablir", AMBER, True, True), (".", INK, False, True)], 16, space_after=0)
source(s, "Directive NIS2 (cyber.gouv.fr) · Règlement DORA (ACPR / Banque de France · ESMA).")
notes(s, "J'entre dans ma troisième partie : construire la résilience. Et ce n'est plus un choix, l'Europe "
         "l'impose par deux textes. La directive NIS2, transposée en France en 2025, élargit énormément le "
         "périmètre : des milliers d'entités classées essentielles ou importantes selon leur taille, avec des "
         "mesures à la fois techniques ET organisationnelles, une notification à l'ANSSI en 24 heures, 72 heures "
         "puis 30 jours, et — c'est nouveau — la responsabilité personnelle des dirigeants, jusqu'à 10 millions "
         "d'euros ou 2 % du chiffre d'affaires. Le règlement DORA, appliqué depuis janvier 2025 à plus de 22 000 "
         "entités financières, impose des tests de résilience réguliers et la surveillance des sous-traitants "
         "informatiques. Ces deux textes actent un basculement de doctrine : on n'exige plus seulement d'empêcher, "
         "mais de pouvoir encaisser et se rétablir.")

# ======================================================================
# SLIDE 10 — AI ACT & RGPD
# ======================================================================
s = slide()
head(s, "10", "Sécuriser l'IA elle-même", [("L'", INK, True, False), ("AI Act", BLUE, True, False), (" répond aux attaques de la Partie II", INK, True, False)])
logos(s, [os.path.join(IM, "eu-flag.png"), os.path.join(IM, "cnil-logo.png")])
picture_fit(s, os.path.join(CH, "chart-04-reglementation-timeline.png"), 2.3, 1.55, 8.7)
cy = 5.35; cw = 3.87; chh = 1.55
mini = [
    (0.55, "AI Act · art. 15", BLUE, "Robustesse + cybersécurité : résister à l'empoisonnement & aux exemples adverses. 35 M€ / 7 %."),
    (4.73, "RGPD · art. 32-33", GREEN, "Sécurité appropriée · notif. 72 h. Faille ANTS = manquement type."),
    (8.91, "ANSSI-PA-102", AMBER, "35 recommandations pour sécuriser une IA générative."),
]
for (x, ttl, col, body) in mini:
    rrect(s, x, cy, cw, chh, CARDB, line=BORDER, lw=1.0)
    _, tf = tbox(s, x+0.22, cy+0.16, cw-0.44, chh-0.3)
    simple(tf, ttl, 13.5, col, bold=True, space_after=6)
    simple(tf, body, 12, BODY, space_after=0, first=False)
source(s, "Commission européenne (AI Act) · RGPD art. 32-33 · La Dépêche (ANTS) · ANSSI-PA-102 (2024).")
notes(s, "La partie II a montré que l'IA elle-même est attaquable ; la bonne nouvelle, c'est que le droit vient "
         "de l'intégrer. L'AI Act classe les systèmes en quatre niveaux de risque ; les IA gérant une "
         "infrastructure critique sont classées haut risque, et son article 15 exige explicitement exactitude, "
         "robustesse et cybersécurité — résistance à l'empoisonnement et aux exemples adverses. Autrement dit, "
         "les attaques que je décrivais il y a deux minutes deviennent une non-conformité légale, avec 35 millions "
         "ou 7 % du chiffre d'affaires à la clé. Et le RGPD imposait déjà la sécurité : l'article 32, des mesures "
         "appropriées, l'article 33, la notification en 72 heures. La fuite de l'ANTS, 11,7 millions de comptes par "
         "une faille triviale, en est le manquement type. Enfin, l'ANSSI a publié 35 recommandations pour "
         "sécuriser une IA générative — le pont concret entre le droit et la technique.")

# ======================================================================
# SLIDE 11 — LEVIERS
# ======================================================================
s = slide()
head(s, "11", "Les leviers de la résilience · trois familles", [("Technique · Organisationnel · Juridique", INK, True, False)])
_, tf = tbox(s, 0.55, 2.0, 6.55, 4.6)
simple(tf, "⚙️  Techniques", 16, BLUE, bold=True, space_after=8)
for rs in [
    [("Zero Trust", INK, True, False), (" · défense en profondeur · SOC/IA", BODY, False, False)],
    [("MLSecOps", INK, True, False), (" — sécuriser l'IA", BODY, False, False)],
    [("PRA / PCA", INK, True, False), (" — sauvegardes immuables", BODY, False, False)],
]:
    p = tf.add_paragraph(); p.space_after = Pt(7); p.line_spacing = 1.05
    _set(p.add_run(), "•  ", 14.5, BODY)
    for (t, c, b, it) in rs: _set(p.add_run(), t, 14.5, c, bold=b, italic=it)
p = tf.add_paragraph(); p.space_before = Pt(10)
runs_para(p, [("🏛️  Organisationnels", AMBER, True, False), ("  (souvent oublié)", MUTE, False, False)], 16, space_after=8)
for rs in [
    [("RSSI · DPO · comité éthique IA", INK, True, False)],
    [("EBIOS RM · AIPD · classification", INK, True, False)],
    [("Politique d'usage IA · formation · red team", INK, True, False)],
]:
    p = tf.add_paragraph(); p.space_after = Pt(7); p.line_spacing = 1.05
    _set(p.add_run(), "•  ", 14.5, BODY)
    for (t, c, b, it) in rs: _set(p.add_run(), t, 14.5, c, bold=b, italic=it)
p = tf.add_paragraph(); p.space_before = Pt(10)
runs_para(p, [("⚖️  Juridiques", GREEN, True, False)], 16, space_after=8)
p = tf.add_paragraph(); p.line_spacing = 1.05
_set(p.add_run(), "•  ", 14.5, BODY)
_set(p.add_run(), "NIS2 · DORA · AI Act · RGPD · clauses (art. 28)", 14.5, INK, bold=True)
picture_fit(s, os.path.join(CH, "chart-05-resilience-triangle.png"), 7.3, 2.65, 5.5)
source(s, "NIST SP 800-207 · OWASP Top 10 LLM 2025 · ANSSI EBIOS RM · Thomson Reuters / UNESCO.")
notes(s, "Ma problématique annonçait trois plans, je les traite frontalement, avec trois familles de leviers. "
         "Sur le plan technique, le socle c'est le Zero Trust — ne jamais faire confiance, toujours vérifier — "
         "la défense en profondeur, le SOC augmenté par l'IA, et le MLSecOps pour sécuriser l'IA elle-même ; plus "
         "le plan de reprise avec sauvegardes immuables, ce qui permet de dire non à un rançongiciel. Sur le plan "
         "organisationnel, celui qu'on oublie le plus : la gouvernance avec un RSSI, un DPO, un comité d'éthique ; "
         "la méthode EBIOS Risk Manager, l'analyse d'impact AIPD, la classification des données ; une politique "
         "d'usage de l'IA contre le shadow AI ; et la formation — 70 % des DRH en font une priorité. Sur le plan "
         "juridique, transformer NIS2, DORA, AI Act et RGPD en feuille de route, et la répercuter sur les "
         "fournisseurs par contrat. Ces trois familles ne fonctionnent qu'ensemble.")

# ======================================================================
# SLIDE 12 — CONCLUSION
# ======================================================================
s = slide()
head(s, "12", "Conclusion · Ouverture", [("L'épée à double tranchant, en équilibre", INK, True, False)])
cw = 3.87; y = 1.9; chh = 2.15
concl = [
    (0.55, "1", BLUE, [("L'IA = ", BODY, False, False), ("multiplicateur de force", BLUE, True, False), (" en défense.", BODY, False, False)]),
    (4.73, "2", RED, [("La même IA ", BODY, False, False), ("arme l'attaquant", RED, True, False), (" et devient une cible.", BODY, False, False)]),
    (8.91, "3", AMBER, [("La ", BODY, False, False), ("résilience", AMBER, True, False), (" = technique + organisation + droit.", BODY, False, False)]),
]
for (x, num, col, runs) in concl:
    rrect(s, x, y, cw, chh, CARDB, line=BORDER, lw=1.0)
    _, tf = tbox(s, x+0.25, y, cw-0.5, chh, anchor=MSO_ANCHOR.MIDDLE)
    simple(tf, num, 28, col, bold=True, space_after=10)
    runs_para(tf.add_paragraph(), runs, 15, space_after=0, line=1.12)
rrect(s, 0.55, 4.35, 12.23, 0.95, AMBBG, line=AMBER, lw=1.0)
_, tf = tbox(s, 0.9, 4.35, 11.5, 0.95, anchor=MSO_ANCHOR.MIDDLE)
runs_para(tf.paragraphs[0], [("La question n'est plus ", INK, False, True), ("si", INK, True, True),
              (" on sera attaqué, mais ", INK, False, True), ("quand", AMBER, True, True),
              (" — et si le SI ", INK, False, True), ("tiendra", INK, True, True), (".", INK, False, True)], 19, space_after=0)
_, tf = tbox(s, 0.55, 5.6, 12.23, 1.0)
runs_para(tf.paragraphs[0], [("Question ouverte : ", BLUE, True, True),
              ("l'humain reste-t-il l'arbitre de la cybersécurité… ou en devient-il la variable d'ajustement ?", INK, False, True)], 16, space_after=0, line=1.15)
source(s, "IBM 2025 · ENISA 2025 · Arup 2024.   —   Je vous remercie.")
notes(s, "Je conclus en trois points. Un : l'IA est un vrai multiplicateur de force pour la défense — le rapport "
         "IBM le chiffre à 1,9 million d'économie par violation et 80 jours de détection gagnés. Deux : mais la "
         "même IA arme l'attaquant — 80 % du phishing, des deepfakes à 25 millions — et devient elle-même une "
         "surface d'attaque. C'est l'épée à double tranchant. Trois, ma réponse à la problématique : la résilience "
         "ne se décrète pas, elle naît de la convergence des trois plans, sous le principe « assume the breach » — "
         "partir du principe qu'on sera pénétré et concevoir le SI pour tenir quand même. La question n'est plus "
         "si on sera attaqué, mais quand, et si le système tiendra. Je termine par une question ouverte : à mesure "
         "que défenseurs et attaquants s'équipent de la même IA, l'humain reste-t-il l'arbitre de cette course… ou "
         "en devient-il la variable d'ajustement ? Je vous remercie.")

# ======================================================================
# SLIDE 13 — SOURCES
# ======================================================================
s = slide()
head(s, "13", "Bibliographie · Sources vérifiées", [("Sources", INK, True, False)])
cols = [
    (0.55, "🏛️ Institutionnel", BLUE, [
        "ANSSI — Panorama 2025 · guide IA (PA-102) · EBIOS RM",
        "ENISA — Threat Landscape 2025",
        "Commission européenne — AI Act · NIS2 · DORA",
        "NIST — CSF 2.0 · SP 800-207",
        "RGPD — art. 28, 32, 33",
    ]),
    (4.73, "📊 Études & marché", AMBER, [
        "IBM — Cost of a Data Breach 2025",
        "Gartner / MarketsandMarkets — marché IA-cyber",
        "Thomson Reuters × UNESCO — gouvernance IA",
        "Cegos — baromètre compétences 2026",
    ]),
    (8.91, "📰 Faits · 📚 Référentiels", GREEN, [
        "CNN / Fortune — deepfake Arup (25,6 M$)",
        "La Dépêche — fuite ANTS 11,7 M",
        "OWASP — Top 10 LLM 2025",
        "MITRE ATLAS · NIST AI RMF",
    ]),
]
for (x, ttl, col, items) in cols:
    _, tf = tbox(s, x, 2.0, 3.87, 4.5)
    simple(tf, ttl, 15, col, bold=True, space_after=12)
    for it in items:
        p = tf.add_paragraph(); p.space_after = Pt(10); p.line_spacing = 1.05
        _set(p.add_run(), "•  ", 12.5, BODY); _set(p.add_run(), it, 12.5, BODY)
source(s, "Bibliographie complète : sources.md (25 entrées vérifiées).")
notes(s, "Voici mes sources, organisées en institutionnel, études de marché, presse et référentiels techniques. "
         "Chaque chiffre du deck a une source nominative ; la bibliographie détaillée est disponible si vous "
         "souhaitez vérifier une donnée.")

# ---- save ----
out = os.path.join(BASE, SLUG + ".pptx")
prs.save(out)
print("OK ->", out)
