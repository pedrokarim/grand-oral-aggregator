# Questions probables du jury — et réponses prêtes à dire

> Sujet : **Cybersécurité et IA, l'avenir d'un SI résilient**
> Chaque réponse est sourcée et calibrée pour l'oral (30-60 s). Les références renvoient à `sources.md`.

---

## 🔵 Définitions / fondamentaux

### Q1. Quelle est la différence entre sécurité et résilience ?

La **sécurité** cherche à *empêcher* l'attaque : pare-feu, chiffrement, contrôle d'accès. La **résilience** part du principe qu'une attaque *finira par passer* et organise la **continuité et le rétablissement** du service. C'est le principe « assume the breach ». Le référentiel NIST CSF 2.0 le formalise avec six fonctions, dont **Respond** et **Recover** : on ne mesure plus seulement la capacité à bloquer, mais le temps de retour à la normale. C'est pour ça que le sujet parle de « SI résilient » et pas seulement de « SI sécurisé ». *(S18)*

### Q2. Concrètement, quel type d'IA utilise-t-on en cybersécurité défensive ?

Essentiellement du **machine learning**, pas de l'IA générative. Deux familles : l'apprentissage **supervisé**, qui reconnaît des menaces connues à partir d'exemples étiquetés (proche des signatures antivirus) ; et l'apprentissage **non supervisé**, qui fait de la **détection d'anomalies** — c'est le cœur de l'UEBA — pour repérer un comportement inédit sans le connaître à l'avance. L'IA générative, elle, sert surtout à assister l'analyste (résumer un incident, écrire une requête) et se déploie côté SOC via SIEM et SOAR. *(S8, S6)*

---

## 🔵 Sanctions / réglementation

### Q3. NIS2, DORA, AI Act, RGPD… ça fait beaucoup. Comment un manager du SI s'y retrouve ?

Ils ne visent pas la même chose et se **cumulent** : le **RGPD** protège les données personnelles (sanction 20 M€/4 % CA) ; **NIS2** impose la cyber-résilience à des milliers d'entités selon leur taille (10 M€/2 %) ; **DORA** fait pareil, mais spécifiquement pour la finance et par application directe ; l'**AI Act** encadre les systèmes d'IA eux-mêmes (35 M€/7 %). Le rôle du manager du SI, c'est de bâtir **une seule feuille de route de conformité** qui satisfait les quatre, au lieu de les traiter en silos — car les mesures se recoupent largement (analyse de risque, notification, gouvernance). *(S3, S4, S6bis, S7)*

### Q4. NIS2 s'applique-t-elle aux PME ?

Oui, et c'est la nouveauté. NIS2 descend jusqu'aux entités **« importantes »** dès **50 salariés ou 10 M€** de chiffre d'affaires dans des secteurs élargis. Beaucoup de PME sont donc concernées pour la première fois — ce qui est cohérent avec le fait que, selon l'ANSSI, **48 %** des victimes de rançongiciel sont déjà des PME/TPE/ETI. La difficulté, c'est que ces structures ont peu de moyens : d'où l'importance de l'automatisation et des services managés. *(S3, S1)*

---

## 🔵 Techniques

### Q5. Qu'est-ce que l'empoisonnement de données, et comment s'en protéger ?

L'**empoisonnement** (data poisoning) consiste à injecter des données corrompues dans le jeu d'**entraînement** d'un modèle, pour qu'il apprenne un mauvais comportement — par exemple laisser passer un type de malware. On s'en protège par la **gouvernance des données d'entraînement** (traçabilité, contrôle des sources), la détection d'anomalies dans le dataset, et des **tests adverses** réguliers. C'est précisément ce qu'exige l'**article 15 de l'AI Act** pour les systèmes à haut risque, et ce que documente le référentiel **MITRE ATLAS**. *(S5, S23)*

### Q6. L'injection de prompt, c'est quoi exactement ?

C'est la vulnérabilité **n°1** du Top 10 OWASP pour les applications LLM (LLM01). Elle consiste à glisser des instructions cachées dans l'entrée d'une IA générative pour détourner son comportement. Deux formes : **directe** (l'utilisateur écrit « ignore tes consignes… »), et **indirecte** — la plus dangereuse — où l'instruction malveillante est cachée dans un document ou une page web que l'IA va lire. Comme ni le RAG ni le fine-tuning ne la corrigent complètement, OWASP recommande la **défense en profondeur** : moindre privilège des outils connectés, filtrage entrées/sorties, et **validation humaine** des actions sensibles. *(S13)*

### Q7. Le Zero Trust, n'est-ce pas juste un mot à la mode ?

Non, c'est un **modèle d'architecture** normé par le NIST (SP 800-207). L'idée : abandonner le modèle « château fort » (on fait confiance à tout ce qui est dans le réseau) au profit du « **ne jamais faire confiance, toujours vérifier** ». Chaque accès est authentifié, autorisé et chiffré, indépendamment de sa provenance. C'est ce qui limite la **propagation latérale** d'un attaquant qui a déjà pénétré — donc un levier de résilience direct : même si une brèche s'ouvre, elle ne se propage pas. *(S10)*

---

## 🔵 Contre-arguments / questions piège

### Q8. Si l'IA aide autant l'attaquant que le défenseur, n'est-on pas dans une impasse ?

C'est une **course**, pas une impasse. La symétrie des outils est réelle, mais le défenseur garde des avantages structurels : la **connaissance de son propre SI**, les données historiques pour entraîner ses modèles, et le **cadre légal** qui l'oblige à un socle minimal (NIS2, DORA). Le différenciateur n'est plus l'outil mais la **maturité organisationnelle** : gouvernance, entraînement, capacité de rétablissement. C'est exactement pour ça que ma réponse est la résilience et pas la « supériorité technique ». *(S18, S3)*

### Q9. Le chiffre « l'IA économise 1,9 M$ par violation » ne vient-il pas d'IBM, qui vend justement de l'IA de sécurité ?

Bonne remarque, et c'est pour ça que je le cite **nominativement** comme « selon IBM » et non comme une vérité absolue. IBM a effectivement un intérêt commercial. Mais l'étude repose sur un panel large d'organisations réelles, et la tendance — l'IA réduit le **temps de détection**, donc le coût — est corroborée par la logique métier et d'autres sources. Je le présente donc comme un **ordre de grandeur crédible**, pas comme une preuve. C'est d'ailleurs pourquoi j'équilibre avec le coût des dérives : le shadow AI qui *ajoute* 670 000 $. *(S6)*

### Q10. Faut-il interdire l'IA générative en entreprise pour éviter le shadow AI ?

Non, l'interdiction pousse justement au **shadow AI** — les salariés l'utilisent quand même, mais sans contrôle. La bonne réponse est organisationnelle : fournir un **outil validé**, poser une **politique d'usage claire**, et former. IBM montre que le problème n'est pas l'IA mais l'**absence de contrôle d'accès** : 97 % des organisations touchées par un incident IA n'en avaient aucun. Interdire, c'est renoncer aux gains de la Partie I ; encadrer, c'est le rôle du manager du SI. *(S6, S16)*

### Q11. Votre sujet parle beaucoup de réglementation. Où est la vraie technique ?

La technique est le cœur de la Partie I et de la Partie II : SIEM, SOAR, UEBA, EDR/XDR côté défense ; empoisonnement, exemples adverses, injection de prompt côté attaque ; Zero Trust, MLSecOps, sauvegardes immuables côté résilience. Le droit n'arrive qu'en Partie III parce que, dans mon angle de **manager du SI**, la technique doit être **pilotée** — un SOC sans gouvernance ni cadre légal ne produit pas de résilience. Les trois plans sont indissociables, c'est ma problématique. *(S10, S13, S6)*

---

## 🔵 Ouverture / réflexion

### Q12. L'IA finira-t-elle par remplacer les analystes de sécurité ?

Je ne le crois pas à court terme. L'IA **automatise le tri** — le premier niveau, la « fatigue d'alerte » — mais la décision sur un incident grave, l'investigation, la gestion de crise restent humaines. Le rapport IBM le montre indirectement : les organisations les plus performantes **combinent** IA et plan de réponse **testé par des humains**. Le métier se déplace : moins de tri manuel, plus de supervision de l'IA et de MLSecOps. La vraie pénurie, ce sont les compétences — d'où l'importance de la formation (70 % des DRH la jugent prioritaire). *(S6, S12)*

### Q13. Dans dix ans, à quoi ressemble un SI vraiment résilient à l'ère de l'IA ?

À un système conçu selon « assume the breach » : **Zero Trust** par défaut, **segmentation** forte pour contenir toute intrusion, **détection IA** en continu, et surtout une capacité de **rétablissement rapide** — sauvegardes immuables, plans de crise répétés. Côté IA, ses propres modèles seront audités et durcis (AI Act, MLSecOps). Et sur le plan humain, une organisation qui s'entraîne régulièrement, comme on fait des exercices d'évacuation. La résilience ne sera pas un état, mais une **discipline permanente** — technique, organisationnelle et juridique à la fois. *(S18, S5, S10)*

---

## Rappels de posture (jour J)

- **Poser la valeur avant la menace** : ne jamais paraître technophobe.
- **Nommer les technologies** : SIEM, SOAR, UEBA, XDR, Zero Trust, EBIOS RM, MLSecOps, OWASP LLM, MITRE ATLAS.
- **Séparer les régimes de sanction** : RGPD 20 M€/4 % · NIS2 10 M€/2 % · DORA (finance) · AI Act 35 M€/7 %.
- Face à une source contestée : la citer **nominativement**, reconnaître son biais, la présenter comme ordre de grandeur.
- Si on ne sait pas : « Je n'ai pas ce chiffre précis en tête, mais l'ordre de grandeur est… » — jamais d'invention.
