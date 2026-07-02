# Slide 11 — Leviers : techniques · organisationnels · juridiques

> Durée cible : 2 min · Type : synthèse solutions · **3 familles obligatoires**

## Contenu visible

### ⚙️ Techniques (le « comment »)

- **Zero Trust** — « ne jamais faire confiance, toujours vérifier » (*NIST SP 800-207*)
- **Défense en profondeur** + **SOC augmenté** par IA (SIEM / SOAR / XDR)
- **MLSecOps** : sécuriser l'IA — filtrage entrées/sorties, **moindre privilège** des outils, tests adverses, validation humaine des actions à risque (*OWASP*)
- **PRA / PCA** : sauvegardes **immuables**, air-gap → survivre au rançongiciel

### 🏛️ Organisationnels (le « par qui ») — *souvent oublié*

- Gouvernance : **RSSI + DPO + comité éthique IA**
- Analyse de risque **EBIOS RM** · **AIPD** pour les usages IA · classification des données
- **Politique d'usage de l'IA** (contre le shadow AI) · **RACI** / accountability
- **Formation & culture de crise** : sensibilisation, exercices, red team

### ⚖️ Juridiques (le « selon quelles règles »)

- Conformité **NIS2 · DORA · AI Act · RGPD** · homologation de sécurité
- Contractualisation fournisseurs (clauses sécurité, sous-traitance **art. 28 RGPD**)

## Notes orales

> *« Ma problématique annonçait trois plans : je les traite donc frontalement, avec trois familles de leviers. »*

> *« Sur le plan technique, le socle aujourd'hui, c'est le Zero Trust — formalisé par le NIST : on ne fait plus confiance à personne par défaut, même à l'intérieur du réseau, on vérifie à chaque accès. On l'associe à la défense en profondeur et au SOC augmenté par IA qu'on a vu en partie I. Et comme l'IA est elle-même une cible, on ajoute une discipline émergente, le MLSecOps : filtrer les entrées et sorties du modèle, appliquer le moindre privilège, faire des tests adverses, et exiger une validation humaine pour les actions sensibles — ce sont les recommandations de l'OWASP. Enfin, le levier de résilience par excellence : le plan de reprise et de continuité d'activité, avec des sauvegardes immuables. C'est ce qui permet de dire non à un rançongiciel. »*

> *« Sur le plan organisationnel — celui qu'on oublie le plus — la résilience se joue sur la gouvernance : un RSSI, un DPO, un comité d'éthique de l'IA. Des méthodes : l'analyse de risque EBIOS Risk Manager de l'ANSSI, l'analyse d'impact AIPD pour tout usage d'IA sensible, la classification des données. Une politique d'usage de l'IA pour endiguer le shadow AI. Et surtout de la formation : 70 % des DRH placent l'IA en tête des transformations de compétences ; sans exercices de crise réguliers, le meilleur outil ne sert à rien. »* (S12, S15)

> *« Et sur le plan juridique, l'enjeu est de transformer les obligations vues juste avant — NIS2, DORA, AI Act, RGPD — en une vraie feuille de route de conformité, et de la répercuter sur les fournisseurs par contrat, via les clauses de sous-traitance de l'article 28 du RGPD. »*

> *« Ces trois familles ne fonctionnent qu'ensemble : un pare-feu sans gouvernance, ou une charte sans technique, ne produit aucune résilience. »*

## Astuce de scène

- **Compter les trois familles** sur les doigts : le jury doit voir qu'on livre les 3 plans promis dans la problématique.
- Insister sur l'**organisationnel** (le point faible reproché au 28/05) : gouvernance, EBIOS RM, AIPD, formation, exercices de crise — c'est du concret, pas « DPO obligatoire » seul.
- Terminer par la phrase de synthèse (« ne fonctionnent qu'ensemble ») : elle referme la problématique à trois plans.

## Sources

- S10 — NIST SP 800-207 — Zero Trust Architecture (2020)
- S13 — OWASP Top 10 for LLM Applications 2025 — défense en profondeur, moindre privilège
- S11 — ANSSI — méthode EBIOS Risk Manager
- S12 — Le Monde / Cegos — baromètre 2026 : 70 % des DRH placent l'IA en tête
- S15 — RGPD art. 28 (sous-traitance) ; guides ANSSI-PA-102
