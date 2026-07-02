# Slide 07 — II. L'IA, arme + l'IA vulnérable

> Durée cible : 2 min · Type : démonstration de la menace (deux volets)

## Contenu visible

> **Partie II — Le revers.** L'IA arme l'attaquant, ET l'IA déployée dans le SI ouvre une **nouvelle surface d'attaque**.

### A. L'IA qui attaque

- **Phishing / spear-phishing** généré et personnalisé à l'échelle — *ENISA : 80 %+ des e-mails*
- **LLM malveillants** : **WormGPT**, **FraudGPT**, **EscapeGPT** (modèles jailbreakés)
- **Deepfakes** vocaux et vidéo → fraude au président — *cas Arup : 25,6 M$*
- **Reconnaissance & génération de code** automatisées (acteurs étatiques)

### B. L'IA qui se fait attaquer *(sécuriser l'IA elle-même)*

- **Empoisonnement des données** (data poisoning) — corrompre l'entraînement
- **Exemples adverses** — tromper le modèle avec des entrées calculées
- **Injection de prompt** directe & indirecte — *OWASP LLM01, risque n°1*
- **Shadow AI** : IA non autorisée → **+ 670 000 $** par violation (*IBM 2025*)

## Notes orales

> *« Le revers a deux volets, et on oublie souvent le second. »*

> *« Premier volet : l'IA comme arme. L'ENISA confirme que plus de 80 % des e-mails de phishing sont désormais rédigés ou personnalisés par IA. Il existe même des modèles de langage conçus pour le crime — WormGPT, FraudGPT — vendus sur des forums, sans les garde-fous de ChatGPT. Ajoutez les deepfakes : c'est le cas Arup, 25,6 millions de dollars détournés parce que le directeur financier en visio était un faux généré par IA. Et des services de renseignement — la Chine, l'Iran, la Corée du Nord — utilisent des IA grand public pour de la reconnaissance et de la génération de code. »* (S2, S14)

> *« Deuxième volet, plus subtil : quand une organisation déploie de l'IA, cette IA devient elle-même une cible. On peut empoisonner ses données d'entraînement pour la corrompre. On peut la tromper avec des exemples adverses — des entrées calculées pour lui faire prendre un malware pour un fichier sain. Et pour les IA génératives, il y a l'injection de prompt : l'OWASP la classe risque numéro 1 de sa liste 2025 pour les applications LLM. Sans compter le "shadow AI" — les salariés qui utilisent des IA non validées : IBM chiffre ça à 670 000 dollars de surcoût par violation. »* (S3, S13, S6)

> *« Autrement dit : sécuriser AVEC l'IA ne suffit pas, il faut aussi sécuriser l'IA. »*

## Astuce de scène

- Bien **séparer les deux volets** (A : l'IA attaque / B : l'IA est attaquée) — c'est ce qui montre la maîtrise technique et prépare l'AI Act (slide 10).
- Citer **OWASP Top 10 LLM** et **MITRE ATLAS** : deux référentiels que le Lead Tech connaîtra.
- Ne pas s'attarder sur WormGPT (sensationnel) ; passer vite au volet B, moins connu et plus valorisant.

## Sources

- S2 — ENISA Threat Landscape 2025 (80 % phishing IA, WormGPT/FraudGPT, deepfakes)
- S14 — CNN / Fortune — deepfake Arup (25,6 M$)
- S13 — OWASP Top 10 for LLM Applications 2025 (LLM01 injection de prompt) ; MITRE ATLAS
- S6 — IBM 2025 (shadow AI +670 000 $)
