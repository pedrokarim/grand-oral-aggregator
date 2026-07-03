# Grand Oral, Cybersécurité et IA : notes orales condensées

> Version resserrée (format prompteur). L'essentiel et tous les chiffres, avec des enchaînements fluides intégrés au texte. Un bloc de texte parlé par slide.

---

## Slide 01, Titre

Bonjour, je suis Karim, en Master Informatique au CESI, filière Manager le SI. Mon sujet : Cybersécurité et IA, l'avenir d'un SI résilient. Je l'aborde en manager du SI, quelqu'un qui doit à la fois exploiter l'IA pour se défendre, anticiper ses usages offensifs, et garantir que le SI tienne même sous attaque.

---

## Slide 02, Problématique et plan

Je pose d'abord ma problématique, car c'est elle qui tient tout le fil. L'IA transforme la cybersécurité, mais des deux côtés à la fois. Ma question : comment un manager du SI peut faire de l'IA un levier de résilience, plutôt qu'un facteur de risque, sur trois plans indissociables, technique, organisationnel et juridique ? J'y réponds en trois temps : d'abord l'IA comme bouclier de la défense ; ensuite son revers, la même IA qui arme l'attaquant et devient une cible ; enfin les leviers d'un SI résilient, pas seulement sécurisé, mais capable d'encaisser et de se rétablir. Le mot-clé, c'est résilience : on ne peut plus tout empêcher, l'enjeu devient de tenir malgré l'attaque.

---

## Slide 03, Accroche

Trois faits pour planter le décor, et ils racontent la même histoire. Un : selon IBM Cost of a Data Breach 2025, les organisations qui misent sur l'IA en défense économisent 1,9 million de dollars par violation et détectent 80 jours plus tôt, l'IA est un vrai bouclier. Deux : selon l'ENISA, plus de 80 % des e-mails de phishing sont dopés à l'IA, la même technologie sert l'attaquant. Trois, le plus spectaculaire : en 2024, un employé du cabinet Arup a viré 25,6 millions de dollars après une visio où tous ses interlocuteurs, dont le directeur financier, étaient des deepfakes. Bouclier, arme, illusion parfaite : voilà l'épée à double tranchant. La question n'est plus comment empêcher, mais comment rester debout, la résilience.

---

## Slide 04, Définitions clés

Trois définitions pour parler la même langue que le jury. La cybersécurité, ce n'est pas que de la technique : c'est l'ensemble des moyens techniques, organisationnels et humains qui protègent la confidentialité, l'intégrité et la disponibilité, la triade CIA, socle de l'ISO 27000 et de l'ANSSI. L'IA en cybersécurité, c'est du machine learning, avec deux familles : l'apprentissage supervisé, qui reconnaît des menaces connues, et le non supervisé, qui repère l'anomalie inédite. Enfin le SI résilient, le cœur du sujet : la capacité à anticiper, résister, se rétablir et s'adapter. La nuance est capitale : la sécurité cherche à empêcher, la résilience part du principe qu'une partie passera et organise la continuité du service, c'est la logique du NIST Cybersecurity Framework 2.

---

## Slide 05, Partie I. L'IA, bouclier : la cyberdéfense augmentée

Je commence par le côté lumineux, parce qu'il est réel et massif. Le chiffre le plus parlant vient d'IBM 2025 : avec l'IA en défense, une violation coûte 3,6 millions de dollars au lieu de 5,5, soit 1,9 million d'économie, et l'attaque est contenue 80 jours plus vite. Or le temps, c'est tout : plus une intrusion dure, plus elle coûte. Concrètement, l'IA agit dans le SOC : le SIEM couplé à l'UEBA apprend le comportement normal et alerte quand quelqu'un se connecte à 3 h depuis l'étranger et aspire une base ; le SOAR automatise la réponse, isoler le poste, bloquer l'adresse ; l'EDR et le XDR corrèlent postes, réseau et cloud. L'IA ne remplace pas l'analyste, elle trie le déluge d'alertes pour qu'il se concentre sur les vraies, c'est un multiplicateur de force. D'où un marché qui passe d'environ 26 à 86 milliards de dollars.

---

## Slide 06, La bascule : l'IA change de camp

On vient de voir l'IA comme bouclier. Le problème, c'est qu'un outil n'a pas de camp : le machine learning qui repère une anomalie pour le défenseur est celui qui apprend à la maquiller pour l'attaquant. La cybersécurité devient une course symétrique, mêmes armes des deux côtés. Et cette symétrie fait s'effondrer la barrière à l'entrée : hier, un phishing crédible et sans faute demandait du temps et des compétences ; aujourd'hui un modèle de langage le produit en quelques secondes, à l'échelle, personnalisé pour chaque victime. Plus besoin d'être expert pour lancer une attaque sophistiquée. C'est le point de bascule de ma soutenance : je passe du bouclier à l'épée, et je montre comment l'IA réarme l'attaquant et devient elle-même une cible.

---

## Slide 07, Partie II. L'IA, arme et l'IA vulnérable

Le revers a deux volets, et on oublie souvent le second. Premier volet, l'IA comme arme : l'ENISA confirme plus de 80 % de phishing dopé à l'IA ; il existe même des modèles conçus pour le crime, WormGPT, FraudGPT, sans les garde-fous de ChatGPT ; les deepfakes, c'est le cas Arup à 25,6 millions ; et des États, Chine, Iran, Corée du Nord, s'en servent pour la reconnaissance et la génération de code. Deuxième volet, plus subtil : quand on déploie de l'IA, elle devient elle-même une cible. On peut empoisonner ses données d'entraînement, la tromper avec des exemples adverses, ou, pour les IA génératives, l'attaquer par injection de prompt, que l'OWASP classe risque numéro 1 en 2025. Sans oublier le shadow AI, ces IA non validées, chiffré par IBM à 670 000 dollars de surcoût par violation. Autrement dit : sécuriser avec l'IA ne suffit pas, il faut aussi sécuriser l'IA.

---

## Slide 08, Panorama chiffré de la menace 2025

C'est la slide la plus dense, je la lis en deux temps. Les volumes d'abord : en France, l'ANSSI a traité 1 366 incidents en 2025, dont 128 rançongiciels majeurs et 196 exfiltrations de données ; l'ENISA a analysé 4 875 incidents sur l'année. La menace est de masse, permanente. Les usages ensuite, là où l'IA change la donne : plus de 80 % du phishing dopé à l'IA, l'ingénierie sociale industrialisée ; la cible se démocratise, 48 % des victimes de rançongiciel sont des PME, TPE, ETI, car l'attaque automatisée coûte moins cher ; et les secteurs les plus touchés sont l'éducation-recherche, un tiers des incidents, les collectivités, un quart, puis la santé. Un point qualitatif enfin : l'ANSSI note un brouillage entre États et cybercriminels, mêmes outils, mêmes techniques.

---

## Slide 09, Partie III. Bâtir la résilience : le cadre réglementaire (NIS2, DORA)

J'entre dans ma troisième partie, construire la résilience, et le point de départ, c'est que ce n'est plus un choix : l'Europe l'impose par deux textes. Le premier, la directive NIS2, en transposition en France en 2025 : elle élargit le périmètre à des milliers d'entités essentielles ou importantes, exige des mesures à la fois techniques ET organisationnelles, impose un calendrier de notification à l'ANSSI, 24 heures, 72 heures, 30 jours, et engage la responsabilité personnelle des dirigeants, jusqu'à 10 millions d'euros ou 2 % du chiffre d'affaires. Le second, DORA, appliqué depuis janvier 2025 à plus de 22 000 entités financières : tests de résilience réguliers, surveillance des sous-traitants, car une banque est aussi vulnérable que son fournisseur cloud, et notification d'incident en 4 heures. Ces deux textes actent un basculement de doctrine : on n'exige plus seulement d'empêcher, mais de pouvoir encaisser et se rétablir.

---

## Slide 10, Sécuriser l'IA elle-même : AI Act et RGPD

La partie II a montré que l'IA elle-même est attaquable ; la bonne nouvelle, c'est que le droit vient d'intégrer ça. L'AI Act classe les systèmes en quatre niveaux de risque, et les IA d'infrastructure critique sont en haut risque : son article 15 exige un niveau approprié d'exactitude, de robustesse et de cybersécurité, avec résistance explicite à l'empoisonnement et aux exemples adverses. Autrement dit, les attaques d'il y a deux minutes deviennent une non-conformité légale, en application complète le 2 août 2026, jusqu'à 35 millions d'euros ou 7 % du chiffre d'affaires. Et le RGPD imposait déjà la sécurité : article 32, mesures techniques et organisationnelles appropriées, article 33, notification sous 72 heures ; la fuite de l'ANTS, 11,7 millions de comptes par une faille triviale, en est le manquement type. Côté opérationnel enfin, l'ANSSI a publié en 2024 un guide de 35 recommandations pour sécuriser une IA générative, le pont concret entre le droit et la technique.

---

## Slide 11, Leviers : techniques, organisationnels, juridiques

Ma problématique annonçait trois plans, je les traite frontalement. Sur le plan technique, le socle, c'est le Zero Trust du NIST, ne jamais faire confiance par défaut, vérifier à chaque accès, associé à la défense en profondeur et au SOC augmenté ; et comme l'IA est une cible, le MLSecOps, filtrer les entrées et sorties, moindre privilège, tests adverses, validation humaine des actions sensibles ; enfin le PRA-PCA avec sauvegardes immuables, ce qui permet de dire non à un rançongiciel. Sur le plan organisationnel, celui qu'on oublie le plus : gouvernance avec RSSI, DPO, comité d'éthique IA ; méthodes EBIOS Risk Manager, AIPD, classification des données ; une politique d'usage de l'IA contre le shadow AI ; et de la formation, avec des exercices de crise, sans quoi le meilleur outil ne sert à rien. Sur le plan juridique enfin : transformer NIS2, DORA, AI Act et RGPD en une vraie feuille de route de conformité, et la répercuter sur les fournisseurs par contrat, via l'article 28 du RGPD. Ces trois familles ne fonctionnent qu'ensemble : un pare-feu sans gouvernance, ou une charte sans technique, ne produit aucune résilience.

---

## Slide 12, Conclusion et ouverture

Je conclus en trois points. Un : l'IA est un vrai multiplicateur de force pour la défense, 1,9 million d'économie et 80 jours gagnés selon IBM, on aurait tort de s'en priver. Deux : mais la même IA arme l'attaquant, 80 % du phishing, des deepfakes à 25 millions, et devient elle-même une surface à protéger, c'est l'épée à double tranchant. Trois, ma réponse à la problématique : la résilience ne se décrète pas, elle naît de la convergence des trois plans, technique, organisationnel, juridique, sous le principe assume the breach, partir du principe qu'on sera pénétré et concevoir le SI pour tenir quand même. La question n'est plus si on sera attaqué, mais quand, et si le système tiendra. Je terminerai par une question ouverte : à mesure que défenseurs et attaquants s'équipent de la même IA, l'humain reste-t-il l'arbitre de cette course, ou en devient-il la variable d'ajustement ? Je vous remercie.

---

## Slide 13, Sources

Voici mes sources, organisées en institutionnel, études de marché, presse et référentiels techniques. La bibliographie détaillée, avec chaque chiffre et son lien, est disponible si vous souhaitez vérifier une donnée.
