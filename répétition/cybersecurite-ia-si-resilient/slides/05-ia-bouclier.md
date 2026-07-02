# Slide 05 — I. L'IA, bouclier : la cyberdéfense augmentée

> Durée cible : 1 min 30 · Type : démonstration positive (poser la valeur d'abord)

## Contenu visible

> **Partie I — Ce que l'IA apporte à la défense.** Avant de parler des dérives, mesurons pourquoi tous les SOC s'équipent d'IA.

### La valeur, en chiffres

- **− 1,9 M$** par violation avec IA + automatisation étendues (**3,62** vs **5,52 M$**) — *IBM 2025*
- Détection **80+ jours** plus rapide ; délai moyen de maîtrise **241 j**, au plus bas depuis 9 ans — *IBM 2025*
- Marché de l'IA en cybersécurité : **≈ 26 Md$ (2025) → ≈ 86 Md$** — *Gartner / MarketsandMarkets*

### Où l'IA agit dans un SOC

- **SIEM + UEBA** : détecter l'**anomalie comportementale** (accès, volumes, horaires inhabituels)
- **SOAR** : **automatiser la réponse** (playbooks : isoler un poste, bloquer une IP)
- **EDR / XDR** : corréler les signaux sur postes, réseau, cloud
- **Triage d'alertes** : réduire la « fatigue d'alerte » des analystes

## Notes orales

> *« Je commence par le côté lumineux, parce qu'il est réel et massif. »*

> *« Le chiffre le plus parlant vient du rapport IBM 2025 : une organisation qui déploie largement l'IA et l'automatisation en défense paie en moyenne 3,6 millions de dollars par violation, contre 5,5 millions pour celles qui ne le font pas. Soit 1,9 million d'économie. Et surtout, elle détecte et contient l'attaque environ 80 jours plus vite. Or en cybersécurité, le temps, c'est tout : plus une intrusion dure, plus elle coûte. »* (S6)

> *« Concrètement, où l'IA agit-elle ? Dans le centre opérationnel de sécurité, le SOC. Le SIEM — Security Information and Event Management — collecte les journaux ; couplé à de l'UEBA — User and Entity Behavior Analytics — il apprend le comportement normal de chaque utilisateur et lève une alerte quand quelqu'un se connecte à 3 h du matin depuis un autre pays et télécharge toute une base. Le SOAR — Security Orchestration, Automation and Response — automatise ensuite la réaction avec des playbooks : isoler le poste, bloquer l'adresse, sans attendre un humain. Et les solutions EDR puis XDR corrèlent ces signaux sur les postes, le réseau et le cloud. »*

> *« L'IA ne remplace pas l'analyste : elle fait le tri dans le déluge d'alertes pour qu'il se concentre sur les vraies. C'est un multiplicateur de force. C'est pour ça que le marché de l'IA en cybersécurité passe d'environ 26 à 86 milliards de dollars. »* (S9)

## Astuce de scène

- Développer les sigles à l'oral **une fois** : SIEM, SOAR, UEBA, XDR. Le jury Lead Tech valide qu'on sait ce qu'il y a derrière.
- Raconter le scénario « connexion à 3 h depuis l'étranger » : un exemple concret vaut mieux qu'une définition.
- Bien insister : **l'IA assiste, ne remplace pas** — ça prépare le contre-argument « l'IA va supprimer les analystes ».

## Sources

- S6 — IBM Cost of a Data Breach 2025 (−1,9 M$, 241 j, +80 j)
- S9 — Gartner / MarketsandMarkets — marché IA cybersécurité (~26 → ~86 Md$)
