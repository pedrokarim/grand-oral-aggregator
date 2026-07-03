# -*- coding: utf-8 -*-
"""
Construit le deck SUJET (13 slides) DANS la template CESI, en VARIANT les types de
slides (donc les décorations) et en remplissant les PLACEHOLDERS NATIFS (puces de la
charte). Graphiques/photo/logos posés dans les zones libres. Notes conservées.
Projet pro NON touché ; slides d'exemple génériques du sujet supprimées.
Sortie : répétition/<slug>/<slug>-CESI.pptx
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image

REP = os.path.dirname(__file__)
SLUG = "cybersecurite-ia-si-resilient"
TEMPLATE = os.path.join(REP, "Template Grand Oral - CESI 2026.pptx")
CH = os.path.join(REP, SLUG, "assets", "charts")
IM = os.path.join(REP, SLUG, "assets", "img")

NAVY = RGBColor(0x1B, 0x1B, 0x4B); TEAL = RGBColor(0x0E, 0x9F, 0x6E)
BLUE = RGBColor(0x3B, 0x4C, 0xE0); RED = RGBColor(0xC0, 0x39, 0x39)
MUTE = RGBColor(0x64, 0x74, 0x8B); WHITE = RGBColor(0xFF, 0xFF, 0xFF)
CARD = RGBColor(0xF4, 0xF6, 0xFB); BORD = RGBColor(0xD5, 0xDA, 0xE8)
MINTBG = RGBColor(0xE7, 0xF7, 0xEF)
FONT = "Poppins"

prs = Presentation(TEMPLATE)
LAY = {l.name: l for l in prs.slide_layouts}

# ---------- helpers ----------
def sid(sl, i): return next((sh for sh in sl.shapes if sh.shape_id == i), None)
def P(sl, idx): return next((ph for ph in sl.placeholders if ph.placeholder_format.idx == idx), None)
def new(layout): return prs.slides.add_slide(LAY[layout])
def notes(sl, t): sl.notes_slide.notes_text_frame.text = t

def set_para_texts(shape, texts, size=None):
    tf = shape.text_frame
    for i, txt in enumerate(texts):
        if i < len(tf.paragraphs):
            p = tf.paragraphs[i]; rs = p.runs if p.runs else [p.add_run()]
            rs[0].text = txt
            if size: rs[0].font.size = Pt(size)
            for e in rs[1:]: e.text = ""

def title(s, text, size=22, geom=(0.55, 0.34, 9.0, 0.8)):
    ph = P(s, 0)
    ph.left, ph.top, ph.width, ph.height = [Inches(v) for v in geom]
    tf = ph.text_frame; tf.clear(); tf.word_wrap = True
    r = tf.paragraphs[0].add_run(); r.text = text; r.font.size = Pt(size); r.font.bold = True
    r.font.color.rgb = NAVY; r.font.name = FONT
    return ph

def fill(ph, paras, size, geom=None, align=None, anchor=None):
    """Remplit un placeholder natif (puces de la charte). paras = liste de paragraphes,
    chaque paragraphe = liste de runs (texte, couleur|None, gras)."""
    if geom: ph.left, ph.top, ph.width, ph.height = [Inches(v) for v in geom]
    tf = ph.text_frame; tf.clear(); tf.word_wrap = True
    if anchor is not None: tf.vertical_anchor = anchor
    for i, parts in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.line_spacing = 1.05
        if align is not None: p.alignment = align
        for (t, c, b) in parts:
            r = p.add_run(); r.text = t; r.font.size = Pt(size); r.font.bold = b
            if c is not None: r.font.color.rgb = c
            r.font.name = FONT

def box(s, l, t, w, h, anchor=None):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    if anchor is not None: tf.vertical_anchor = anchor
    return tf

def prun(tf, parts, size, sa=4, align=None, first=False, line=1.05):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.space_after = Pt(sa); p.line_spacing = line
    if align is not None: p.alignment = align
    for (t, c, b) in parts:
        r = p.add_run(); r.text = t; r.font.size = Pt(size); r.font.bold = b
        r.font.color.rgb = c; r.font.name = FONT

def rrect(s, l, t, w, h, fill_c, line=None, lw=1.0):
    sp = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    sp.fill.solid(); sp.fill.fore_color.rgb = fill_c
    if line is not None: sp.line.color.rgb = line; sp.line.width = Pt(lw)
    else: sp.line.fill.background()
    sp.shadow.inherit = False
    try: sp.adjustments[0] = 0.08
    except Exception: pass
    return sp

def pic(s, path, l, t, w):
    r = Image.open(path).size[1] / Image.open(path).size[0]
    return s.shapes.add_picture(path, Inches(l), Inches(t), width=Inches(w), height=Inches(w*r))

def pic_cover(s, path, l, t, w, h):
    iw, ih = Image.open(path).size; ar, br = iw/ih, w/h
    p = s.shapes.add_picture(path, Inches(l), Inches(t), width=Inches(w), height=Inches(h))
    if ar > br: c = (1-br/ar)/2; p.crop_left = c; p.crop_right = c
    else: c = (1-ar/br)/2; p.crop_top = c; p.crop_bottom = c
    return p

def logos(s, files, x_right=9.45, y=0.5, h=0.34, gap=0.1):
    ws = [h*Image.open(f).size[0]/Image.open(f).size[1] for f in files]
    x = x_right - (sum(ws) + gap*(len(files)-1))
    for f, w in zip(files, ws):
        pad = 0.05; rrect(s, x-pad, y-pad, w+2*pad, h+2*pad, WHITE, line=BORD, lw=0.75)
        s.shapes.add_picture(f, Inches(x), Inches(y), height=Inches(h)); x += w+gap

def srcnote(s, text):
    tf = box(s, 0.55, 5.28, 8.9, 0.3)
    prun(tf, [("Sources : ", MUTE, True), (text, MUTE, False)], 8.5, sa=0, first=True)

def delete_slide(index):
    lst = prs.slides._sldIdLst; e = list(lst)[index]
    try: prs.part.drop_rel(e.rId)
    except Exception: pass
    lst.remove(e)

def move_block_to(count, pos):
    lst = prs.slides._sldIdLst; mv = list(lst)[-count:]
    for m in mv: lst.remove(m)
    for i, m in enumerate(mv): lst.insert(pos+i, m)

# ======================================================================
# 01 : TITRE (réutilise la slide titre de la template)
# ======================================================================
s1 = prs.slides[0]
set_para_texts(sid(s1, 599), ["Cybersécurité & IA", "l'avenir d'un SI résilient"], size=32)
notes(s1, "Bonjour, je m'appelle Karim, Master Informatique CESI, filière Manager le SI. Sujet : Cybersécurité "
          "et IA, l'avenir d'un SI résilient, du point de vue du manager du SI.")

# ======================================================================
# 02 : PROBLÉMATIQUE & PLAN  →  SECTION_TITLE_AND_DESCRIPTION (divider centré)
# ======================================================================
s = new("SECTION_TITLE_AND_DESCRIPTION")
title(s, "Problématique & plan", 26, geom=(1.0, 1.35, 8.0, 0.7))
P(s, 0).text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
fill(P(s, 1), [
    [("Comment le manager du SI peut-il faire de l'IA un ", NAVY, False), ("levier de résilience", TEAL, True),
     (", plutôt qu'un facteur de risque, sur les plans ", NAVY, False),
     ("technique", BLUE, True), (", ", NAVY, False), ("organisationnel", TEAL, True),
     (" et ", NAVY, False), ("juridique", NAVY, True), (" ?", NAVY, True)],
    [(" ", NAVY, False)],
    [("I. L'IA bouclier      II. L'IA arme      III. Bâtir la résilience", MUTE, True)],
], 16, geom=(1.2, 2.35, 7.6, 2.0), align=PP_ALIGN.CENTER)
notes(s, "Ma problématique tient tout le fil : faire de l'IA un levier de résilience plutôt qu'un facteur de "
         "risque, sur trois plans indissociables : technique, organisationnel, juridique. Plan en trois temps : "
         "l'IA bouclier, l'IA arme, puis bâtir la résilience. Le mot-clé : résilience, tenir malgré l'attaque.")

# ======================================================================
# 03 : ACCROCHE  →  BIG_NUMBER
# ======================================================================
s = new("TITLE_ONLY")   # décoré (X-grid + arc), on fait les 3 chiffres nous-mêmes
title(s, "L'épée à double tranchant", 24)
for i, (num, col, lab) in enumerate([
        ("− 1,9 M$", TEAL, "l'IA en défense, détection 80 j plus vite (IBM 2025)"),
        ("80 %+", NAVY, "du phishing dopé à l'IA (ENISA 2025)"),
        ("25,6 M$", RED, "un deepfake de DAF en visio (Arup 2024)")]):
    x = 0.55 + i*3.03
    rrect(s, x, 1.5, 2.85, 2.3, CARD, line=BORD, lw=1.0)
    tf = box(s, x+0.15, 1.5, 2.55, 2.3, anchor=MSO_ANCHOR.MIDDLE)
    prun(tf, [(num, col, True)], 30, sa=8, first=True, align=PP_ALIGN.CENTER)
    prun(tf, [(lab, MUTE, False)], 11.5, sa=0, align=PP_ALIGN.CENTER)
rrect(s, 0.55, 4.05, 8.9, 0.75, MINTBG, line=TEAL, lw=1.0)
tf = box(s, 0.85, 4.05, 8.3, 0.75, anchor=MSO_ANCHOR.MIDDLE)
prun(tf, [("La même IA défend et attaque : le vrai enjeu, c'est la ", NAVY, False),
          ("résilience", TEAL, True), (".", NAVY, False)], 15, sa=0, first=True, align=PP_ALIGN.CENTER)
srcnote(s, "IBM 2025, ENISA 2025, CNN / Fortune (Arup, 2024).")
notes(s, "Trois faits, une même technologie. L'IA en défense économise 1,9 million par violation et détecte "
         "80 jours plus tôt (IBM). Plus de 80 % du phishing est dopé à l'IA (ENISA). Et 25,6 millions détournés "
         "par un deepfake en visioconférence (Arup). Bouclier, arme, illusion : d'où l'enjeu de résilience.")

# ======================================================================
# 04 : DÉFINITIONS  →  TITLE_AND_TWO_COLUMNS (natif)
# ======================================================================
s = new("TITLE_AND_TWO_COLUMNS")
title(s, "Trois mots, trois définitions", 24)
fill(P(s, 1), [
    [("Cybersécurité", BLUE, True), (" : triade CIA (confidentialité, intégrité, disponibilité).", NAVY, False)],
    [("IA en cybersécurité", RED, True), (" : machine learning, supervisé pour le connu et non supervisé pour l'anomalie.", NAVY, False)],
], 14, geom=(0.78, 1.55, 4.2, 3.0))
fill(P(s, 2), [
    [("SI résilient", TEAL, True), (" : anticiper, résister, se rétablir, s'adapter (NIST CSF 2.0).", NAVY, False)],
    [("Sécurité = empêcher.", NAVY, True)],
    [("Résilience = encaisser et continuer.", TEAL, True)],
], 14, geom=(5.0, 1.55, 4.2, 3.0))
notes(s, "Trois définitions. La cybersécurité protège trois propriétés : la triade CIA. L'IA en cybersécurité, "
         "c'est du machine learning, supervisé et non supervisé. Le SI résilient : anticiper, résister, se rétablir. "
         "La nuance : la sécurité empêche, la résilience encaisse et continue.")

# ======================================================================
# 05 : I. BOUCLIER  →  ONE_COLUMN_TEXT (texte natif) + graphique libre
# ======================================================================
s = new("ONE_COLUMN_TEXT")
title(s, "L'IA, bouclier : la cyberdéfense augmentée", 22, geom=(0.55, 0.34, 9.0, 0.8))
fill(P(s, 1), [
    [("−1,9 M$", TEAL, True), (" / violation, détection 80 j + vite (IBM)", NAVY, False)],
    [("Marché IA-cyber : 26 à 86 Md$", NAVY, True)],
    [("SOC : ", NAVY, True), ("SIEM+UEBA, SOAR, EDR/XDR", BLUE, True)],
], 14.5, geom=(0.6, 1.55, 4.4, 3.2))
pic(s, os.path.join(CH, "chart-02-cout-violation-ibm.png"), 5.2, 2.0, 4.3)
srcnote(s, "IBM Cost of a Data Breach 2025, Gartner / MarketsandMarkets.")
notes(s, "La valeur d'abord. IBM 2025 : 1,9 million d'économie par violation avec l'IA, 80 jours de détection "
         "gagnés. Dans le SOC : SIEM plus UEBA détectent l'anomalie, SOAR automatise la réponse. L'IA trie les "
         "alertes, elle ne remplace pas l'analyste. Marché de 26 à 86 milliards.")

# ======================================================================
# 06 : BASCULE  →  CAPTION_ONLY (image + légende) + texte libre
# ======================================================================
s = new("TITLE_AND_BODY")   # décoré (X-grid + dot-line), texte natif à gauche + photo libre
title(s, "Un outil n'a pas de camp", 24)
fill(P(s, 1), [
    [("DÉFENSE / même ML / ATTAQUE", BLUE, True)],
    [("Détecter, ou contourner la détection", NAVY, False)],
    [("Écrire des règles, ou des phishing parfaits", NAVY, False)],
    [("La barrière à l'entrée s'effondre.", RED, True)],
], 13.5, geom=(0.6, 1.55, 4.4, 3.2))
rrect(s, 5.1, 1.55, 4.35, 2.75, WHITE, line=BORD, lw=1.0)
pic_cover(s, os.path.join(IM, "datacenter.jpg"), 5.2, 1.65, 4.15, 2.0)
tf2 = box(s, 5.2, 3.8, 4.15, 0.7)
prun(tf2, [("Le SI, au milieu : même infra, deux usages.", NAVY, True)], 10.5, sa=2, first=True)
prun(tf2, [("Photo : CERN, CC BY-SA 3.0 (Wikimedia Commons)", MUTE, False)], 9, sa=0)
srcnote(s, "Transition : du bouclier à l'épée.")
notes(s, "Un outil n'a pas de camp : le machine learning qui détecte pour le défenseur maquille pour l'attaquant. "
         "Course symétrique, et la barrière à l'entrée s'effondre. Point de bascule : je passe du bouclier à l'épée.")

# ======================================================================
# 07 : II. ARME  →  TITLE_AND_TWO_COLUMNS (natif) + logo ENISA
# ======================================================================
s = new("TITLE_AND_TWO_COLUMNS")
title(s, "L'IA qui attaque… et l'IA qu'on attaque", 22)
logos(s, [os.path.join(IM, "enisa-logo.png")])
fill(P(s, 1), [
    [("A, L'IA qui attaque", RED, True)],
    [("Phishing IA : 80 % des e-mails", NAVY, False)],
    [("WormGPT, FraudGPT (LLM du crime)", NAVY, False)],
    [("Deepfakes (Arup, 25,6 M$)", NAVY, False)],
], 13.5, geom=(0.78, 1.55, 4.2, 3.2))
fill(P(s, 2), [
    [("B, L'IA qu'on attaque", TEAL, True)],
    [("Empoisonnement des données", NAVY, False)],
    [("Exemples adverses", NAVY, False)],
    [("Injection de prompt (OWASP LLM01)", NAVY, False)],
    [("Shadow AI : +670 k$ / violation", NAVY, False)],
], 13.5, geom=(5.0, 1.55, 4.2, 3.2))
srcnote(s, "ENISA 2025, CNN / Fortune (Arup), OWASP Top 10 LLM 2025, MITRE ATLAS, IBM 2025.")
notes(s, "Deux volets. A, l'IA arme : 80 % du phishing dopé à l'IA, WormGPT, FraudGPT, les deepfakes (Arup, "
         "25,6 millions). B, l'IA cible : empoisonnement, exemples adverses, injection de prompt (risque n°1 OWASP), "
         "shadow AI. Sécuriser avec l'IA ne suffit pas : sécuriser l'IA.")

# ======================================================================
# 08 : PANORAMA  →  TITLE_AND_BODY (géométrie forcée) + graphique + ANSSI
# ======================================================================
s = new("TITLE_AND_BODY")
title(s, "Les chiffres… et, séparément, les usages", 22)
logos(s, [os.path.join(IM, "anssi-logo.jpg")])
fill(P(s, 1), [
    [("Volumes", BLUE, True)],
    [("1 366", NAVY, True), (" incidents ANSSI, ", NAVY, False), ("128", NAVY, True), (" rançongiciels, ", NAVY, False), ("196", NAVY, True), (" exfiltrations", NAVY, False)],
    [("4 875", NAVY, True), (" incidents analysés (ENISA)", NAVY, False)],
    [("Usages", RED, True)],
    [("80 %+", NAVY, True), (" du phishing dopé à l'IA", NAVY, False)],
    [("48 %", NAVY, True), (" des victimes = PME / TPE / ETI", NAVY, False)],
], 13, geom=(0.6, 1.45, 4.55, 3.5))
pic(s, os.path.join(CH, "chart-03-menace-secteurs.png"), 5.2, 1.7, 4.3)
srcnote(s, "ANSSI, Panorama de la cybermenace 2025, ENISA, Threat Landscape 2025.")
notes(s, "En deux temps. Les volumes : 1 366 incidents ANSSI, 128 rançongiciels, 196 exfiltrations ; 4 875 "
         "analysés par l'ENISA. Les usages : 80 % du phishing dopé à l'IA, 48 % des victimes sont des PME. "
         "Secteurs éducation-recherche, collectivités, santé. Brouillage États-cybercriminels.")

# ======================================================================
# 09 : NIS2 / DORA  →  TITLE_AND_TWO_COLUMNS (natif) + drapeau UE
# ======================================================================
s = new("TITLE_AND_TWO_COLUMNS")
title(s, "Bâtir la résilience : le cadre réglementaire", 22)
logos(s, [os.path.join(IM, "eu-flag.png")])
fill(P(s, 1), [
    [("NIS2 : tout l'écosystème", BLUE, True)],
    [("Entités essentielles & importantes", NAVY, False)],
    [("Notification 24 h / 72 h / 30 j", NAVY, False)],
    [("10 M€ / 2 % CA, dirigeants responsables", NAVY, False)],
], 13.5, geom=(0.78, 1.55, 4.2, 3.2))
fill(P(s, 2), [
    [("DORA : la finance", TEAL, True)],
    [("Depuis le 17/01/2025, > 22 000 entités", NAVY, False)],
    [("Tests de résilience obligatoires", NAVY, False)],
    [("Incident majeur notifié en 4 h", NAVY, False)],
], 13.5, geom=(5.0, 1.55, 4.2, 3.2))
srcnote(s, "Directive NIS2 (cyber.gouv.fr), Règlement DORA (ACPR / Banque de France, ESMA).")
notes(s, "Bâtir la résilience, l'Europe l'impose. NIS2, transposée en 2025 : milliers d'entités, mesures techniques "
         "et organisationnelles, notification 24-72 heures puis 30 jours, responsabilité des dirigeants. DORA, depuis "
         "janvier 2025, plus de 22 000 entités financières : tests de résilience, supervision des sous-traitants. "
         "Basculement : encaisser et se rétablir.")

# ======================================================================
# 10 : AI ACT  →  TITLE_ONLY + frise + mini-cartes + logos
# ======================================================================
s = new("TITLE_ONLY")
title(s, "L'AI Act répond aux attaques de la Partie II", 22)
logos(s, [os.path.join(IM, "eu-flag.png"), os.path.join(IM, "cnil-logo.png")])
pic(s, os.path.join(CH, "chart-04-reglementation-timeline.png"), 1.85, 1.2, 6.3)
mini = [(0.55, "AI Act, art. 15", BLUE, "Robustesse + cybersécurité : résister à l'empoisonnement. 35 M€ / 7 %."),
        (3.68, "RGPD, art. 32-33", TEAL, "Sécurité appropriée, notif. 72 h. Faille ANTS = manquement type."),
        (6.81, "ANSSI-PA-102", NAVY, "35 recommandations pour sécuriser une IA générative.")]
for (x, ttl, col, body) in mini:
    rrect(s, x, 4.05, 2.85, 1.05, CARD, line=BORD, lw=1.0)
    tf = box(s, x+0.15, 4.15, 2.55, 0.9)
    prun(tf, [(ttl, col, True)], 11.5, sa=3, first=True); prun(tf, [(body, NAVY, False)], 9.5, sa=0)
srcnote(s, "Commission européenne (AI Act), RGPD art. 32-33, La Dépêche (ANTS), ANSSI-PA-102 (2024).")
notes(s, "L'IA est attaquable ; le droit l'intègre. L'AI Act classe en quatre niveaux ; les IA d'infrastructure "
         "critique sont haut risque, et l'article 15 exige robustesse et cybersécurité : résistance à l'empoisonnement "
         "et aux exemples adverses. Les attaques deviennent une non-conformité (35 millions / 7 %). Le RGPD imposait "
         "déjà la sécurité (art. 32) et la notification 72 h ; la fuite ANTS en est le manquement type. L'ANSSI "
         "publie 35 recommandations pour l'IA générative.")

# ======================================================================
# 11 : LEVIERS  →  ONE_COLUMN_TEXT + triangle libre
# ======================================================================
s = new("ONE_COLUMN_TEXT")
title(s, "Trois familles de leviers", 24, geom=(0.55, 0.34, 9.0, 0.8))
fill(P(s, 1), [
    [("Techniques", BLUE, True), (" : Zero Trust, SOC/IA, MLSecOps, PRA/PCA", NAVY, False)],
    [("Organisationnels", TEAL, True), (" : RSSI, DPO, EBIOS RM, AIPD, formation", NAVY, False)],
    [("Juridiques", NAVY, True), (" : NIS2, DORA, AI Act, RGPD, clauses (art. 28)", NAVY, False)],
], 14, geom=(0.6, 1.6, 4.5, 3.2))
pic(s, os.path.join(CH, "chart-05-resilience-triangle.png"), 5.2, 1.7, 4.25)
srcnote(s, "NIST SP 800-207, OWASP Top 10 LLM 2025, ANSSI EBIOS RM, Thomson Reuters / UNESCO.")
notes(s, "Trois plans, trois familles. Technique : Zero Trust, défense en profondeur, SOC augmenté, MLSecOps, "
         "PRA/PCA. Organisationnel : gouvernance RSSI-DPO-comité d'éthique, EBIOS RM, AIPD, formation. Juridique : "
         "NIS2, DORA, AI Act, RGPD. Ces familles ne fonctionnent qu'ensemble.")

# ======================================================================
# 12 : CONCLUSION  →  MAIN_POINT (point fort) + rappels + question
# ======================================================================
s = new("SECTION_TITLE_AND_DESCRIPTION")   # décoré (dot-line + X-grid + arc) au lieu de MAIN_POINT (vide)
title(s, "La question n'est plus SI on sera attaqué, mais QUAND, et si le SI tiendra.",
      24, geom=(0.8, 1.15, 8.4, 1.4))
P(s, 0).text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
tf = box(s, 0.8, 2.9, 8.4, 1.3, anchor=MSO_ANCHOR.TOP)
prun(tf, [("1. L'IA = multiplicateur de force en défense.   ", BLUE, True),
          ("2. La même IA arme l'attaquant et devient une cible.", RED, True)], 13.5, sa=8, first=True, align=PP_ALIGN.CENTER)
prun(tf, [("3. La résilience = technique + organisation + droit  (« assume the breach »).", TEAL, True)], 13.5, sa=0, align=PP_ALIGN.CENTER)
tf2 = box(s, 0.8, 4.35, 8.4, 0.8, anchor=MSO_ANCHOR.TOP)
prun(tf2, [("Question ouverte : ", BLUE, True),
           ("l'humain reste-t-il l'arbitre de la cybersécurité… ou en devient-il la variable d'ajustement ?", NAVY, False)], 13, sa=0, align=PP_ALIGN.CENTER, line=1.15)
notes(s, "Trois points. Un : l'IA est un multiplicateur de force en défense. Deux : la même IA arme l'attaquant "
         "et devient une cible. Trois, ma réponse : la résilience naît de la convergence technique, organisationnelle, "
         "juridique, sous le principe assume the breach. La question n'est plus si, mais quand, et si le SI tiendra. "
         "Question ouverte : l'humain, arbitre ou variable d'ajustement ? Merci.")

# ======================================================================
# 13 : SOURCES  →  TITLE_AND_TWO_COLUMNS (natif)
# ======================================================================
s = new("TITLE_AND_TWO_COLUMNS")
title(s, "Sources", 24)
fill(P(s, 1), [
    [("Institutionnel", BLUE, True)],
    [("ANSSI (Panorama 2025, PA-102), ENISA 2025", NAVY, False)],
    [("Commission UE : AI Act, NIS2, DORA", NAVY, False)],
    [("NIST : CSF 2.0, SP 800-207, RGPD", NAVY, False)],
], 13, geom=(0.78, 1.55, 4.2, 3.2))
fill(P(s, 2), [
    [("Études, Faits, Référentiels", TEAL, True)],
    [("IBM 2025, Gartner, Thomson Reuters × UNESCO", NAVY, False)],
    [("CNN / Fortune (Arup), La Dépêche (ANTS)", NAVY, False)],
    [("OWASP Top 10 LLM, MITRE ATLAS, NIST AI RMF", NAVY, False)],
], 13, geom=(5.0, 1.55, 4.2, 3.2))
srcnote(s, "Bibliographie complète : sources.md (25 entrées vérifiées).")
notes(s, "Mes sources : institutionnel, études, presse et référentiels. Chaque chiffre a une source nominative ; "
         "bibliographie détaillée disponible.")

# ======================================================================
# Supprimer UNIQUEMENT les slides DÉMO :
#   - old 2,3,4  (indices 1,2,3) : intro générique du sujet (remplacée)
#   - old 5..10  (indices 4..9)  : démo projet MBFit (Titre générique, Étapes clés,
#                                  Déroulement, Bilan projet, Expo Universal, REX)
# GARDER : old 1 (titre) + old 11..16 (indices 10..15) = VRAI projet pro de Karim
#          (Projet professionnel, Parcours, Compétences, Métier visé, Projection, Merci)
# ======================================================================
for idx in range(9, 0, -1):    # indices 9..1
    delete_slide(idx)
# placer les 12 slides sujet juste après le titre, avant le projet pro
move_block_to(12, 1)

# ======================================================================
# Notes du présentateur, format PUCES (ouverture + points à aborder + transition).
# Réécrit les notes des 13 slides sujet (slides[0..12] après réordonnancement).
# ======================================================================
NOTES_PUCES = []
import re as _re
_raw = open(os.path.join(REP, SLUG, "notes-orales-puces.md"), encoding="utf-8").read()
for _part in _re.split(r"(?m)^## Slide ", _raw)[1:]:
    _lines = _part.splitlines()[1:]
    _lines = [l for l in _lines if l.strip() != "---"]
    NOTES_PUCES.append(chr(10).join(_lines).strip().replace("**", ""))
NOTES_PUCES = NOTES_PUCES[:13]
subject_slides = list(prs.slides)[:13]
for sl, txt in zip(subject_slides, NOTES_PUCES):
    sl.notes_slide.notes_text_frame.text = txt

out = os.path.join(REP, SLUG, SLUG + "-CESI.pptx")
prs.save(out)
print("OK ->", out, "| n slides:", len(list(prs.slides._sldIdLst)))
