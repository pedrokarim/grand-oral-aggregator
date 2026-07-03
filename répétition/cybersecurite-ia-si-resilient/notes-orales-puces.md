# Grand Oral, Cybersécurité et IA : notes en puces développées

> Niveau maximal : chaque puce est une phrase complète, reprise des notes verbatim, avec les sigles développés et les exemples. Une phrase d'ouverture, les puces à dire, une transition quand utile. Typographie française. À recopier dans le volet Notes du PPTX.

---

## Slide 01, Titre

**Ouverture.** Bonjour, je m'appelle Karim, je suis étudiant en Master Informatique au CESI, filière Manager le SI.

- Le sujet que je vais traiter est : Cybersécurité et IA, l'avenir d'un SI résilient.
- Je vais l'aborder du point de vue d'un manager du système d'information : quelqu'un qui doit à la fois exploiter l'IA pour se défendre, en anticiper les usages offensifs, et garantir que le SI continue de fonctionner même sous attaque.

---

## Slide 02, Problématique et plan

**Ouverture.** Avant d'entrer dans le sujet, je pose ma problématique, parce que c'est elle qui tient tout le fil.

- L'IA est en train de transformer la cybersécurité, mais des deux côtés à la fois.
- Ma question est donc : comment un manager du SI peut faire de l'IA un levier de résilience, plutôt qu'un nouveau facteur de risque, et cela sur trois plans indissociables : technique, organisationnel et juridique.
- Pour y répondre, je procède en trois temps : d'abord ce que l'IA apporte à la défense, le bouclier ; ensuite le revers, la même IA qui arme les attaquants et devient une surface d'attaque ; enfin les leviers pour construire un SI résilient, pas seulement sécurisé, mais capable d'encaisser et de se rétablir.
- Le mot-clé de ma soutenance, c'est résilience : on ne peut plus tout empêcher, donc l'enjeu devient de tenir malgré l'attaque.

---

## Slide 03, Accroche

**Ouverture.** Trois faits pour planter le décor, et ils racontent tous la même histoire.

- Premier fait : selon le rapport IBM Cost of a Data Breach 2025, les organisations qui utilisent massivement l'IA et l'automatisation en défense économisent 1,9 million de dollars par violation, et détectent les attaques 80 jours plus tôt. L'IA, c'est donc un vrai bouclier.
- Deuxième fait : selon l'ENISA, l'agence européenne de cybersécurité, plus de 80 % des e-mails de phishing analysés fin 2024 utilisaient l'IA pour être rédigés ou personnalisés. La même technologie sert donc l'attaquant.
- Troisième fait, le plus spectaculaire : en 2024, un employé du cabinet d'ingénierie Arup à Hong Kong a viré 25,6 millions de dollars après une visioconférence où tous ses interlocuteurs, y compris le directeur financier, étaient des deepfakes générés par IA.
- Bouclier, arme, et illusion parfaite : voilà l'épée à double tranchant.

**Transition.** La question n'est plus seulement comment empêcher, mais comment rester debout : la résilience.

---

## Slide 04, Définitions clés

**Ouverture.** Trois définitions pour parler la même langue que le jury.

- La cybersécurité, ce n'est pas que de la technique : c'est l'ensemble des moyens techniques, organisationnels et humains qui protègent trois propriétés, la confidentialité, l'intégrité et la disponibilité des données ; on appelle ça la triade CIA, le socle des normes ISO 27000 et de la doctrine de l'ANSSI.
- L'IA en cybersécurité, concrètement, c'est du machine learning, avec deux familles : l'apprentissage supervisé, qui reconnaît des menaces déjà connues à partir d'exemples étiquetés ; et le non supervisé, qui repère l'anomalie, ce qui sort de l'ordinaire, sans savoir à l'avance à quoi elle ressemble, et c'est lui qui détecte les attaques inédites.
- Le SI résilient, le cœur de mon sujet, c'est la capacité à anticiper, résister, se rétablir et s'adapter.
- La nuance est capitale : la sécurité cherche à empêcher l'attaque, la résilience part du principe qu'une partie passera quoi qu'il arrive et organise la continuité du service ; c'est la logique du NIST Cybersecurity Framework version 2 (gouverner, identifier, protéger, détecter, répondre, se rétablir).

---

## Slide 05, Partie I. L'IA, bouclier : la cyberdéfense augmentée

**Ouverture.** Je commence par le côté lumineux, parce qu'il est réel et massif.

- Le chiffre le plus parlant vient du rapport IBM 2025 : une organisation qui déploie largement l'IA et l'automatisation en défense paie en moyenne 3,6 millions de dollars par violation, contre 5,5 millions pour celles qui ne le font pas, soit 1,9 million d'économie.
- Et surtout, elle détecte et contient l'attaque environ 80 jours plus vite : or en cybersécurité le temps c'est tout, plus une intrusion dure, plus elle coûte.
- Concrètement, l'IA agit dans le centre opérationnel de sécurité, le SOC : le SIEM (Security Information and Event Management) collecte les journaux, et couplé à de l'UEBA (User and Entity Behavior Analytics) il apprend le comportement normal de chaque utilisateur.
- Il lève alors une alerte quand quelqu'un se connecte à 3 h du matin depuis un autre pays et télécharge toute une base.
- Le SOAR (Security Orchestration, Automation and Response) automatise ensuite la réaction avec des playbooks : isoler le poste, bloquer l'adresse, sans attendre un humain.
- Et les solutions EDR puis XDR corrèlent ces signaux sur les postes, le réseau et le cloud.
- L'IA ne remplace pas l'analyste : elle fait le tri dans le déluge d'alertes pour qu'il se concentre sur les vraies, c'est un multiplicateur de force.
- C'est pour ça que le marché de l'IA en cybersécurité passe d'environ 26 à 86 milliards de dollars.

---

## Slide 06, La bascule : l'IA change de camp

**Ouverture.** On vient de voir l'IA comme bouclier, mais un outil n'a pas de camp.

- Le machine learning qui repère une anomalie pour le défenseur est exactement celui qui apprend à la maquiller pour l'attaquant : la cybersécurité devient une course symétrique, où les deux camps s'équipent des mêmes armes.
- Et cette symétrie a un effet redoutable : elle fait s'effondrer la barrière à l'entrée.
- Avant, monter une campagne de phishing crédible en français sans faute demandait du temps et des compétences ; aujourd'hui, un modèle de langage le fait en quelques secondes, à l'échelle industrielle, personnalisé pour chaque victime.
- On n'a plus besoin d'être un expert pour lancer une attaque sophistiquée.

**Transition.** C'est exactement le point de bascule : je passe du bouclier à l'épée, et je montre comment l'IA réarme l'attaquant et devient elle-même une cible.

---

## Slide 07, Partie II. L'IA, arme et l'IA vulnérable

**Ouverture.** Le revers a deux volets, et on oublie souvent le second.

- Premier volet, l'IA comme arme :
  - L'ENISA confirme que plus de 80 % des e-mails de phishing sont désormais rédigés ou personnalisés par IA.
  - Il existe même des modèles de langage conçus pour le crime, WormGPT et FraudGPT, vendus sur des forums, sans les garde-fous de ChatGPT.
  - Les deepfakes : c'est le cas Arup, 25,6 millions de dollars détournés parce que le directeur financier en visio était un faux généré par IA.
  - Et des services de renseignement, la Chine, l'Iran, la Corée du Nord, utilisent des IA grand public pour de la reconnaissance et de la génération de code.
- Deuxième volet, plus subtil, l'IA qu'on attaque :
  - Quand une organisation déploie de l'IA, cette IA devient elle-même une cible.
  - On peut empoisonner ses données d'entraînement pour la corrompre, ou la tromper avec des exemples adverses, des entrées calculées pour lui faire prendre un malware pour un fichier sain.
  - Pour les IA génératives, l'injection de prompt est classée risque numéro 1 de la liste OWASP 2025 pour les applications LLM.
  - Sans compter le shadow AI, les salariés qui utilisent des IA non validées : IBM chiffre ça à 670 000 dollars de surcoût par violation.

**Transition.** Autrement dit, sécuriser avec l'IA ne suffit pas, il faut aussi sécuriser l'IA.

---

## Slide 08, Panorama chiffré de la menace 2025

**Ouverture.** Cette slide est la plus dense, alors je la lis en deux temps distincts, parce que ce ne sont pas les mêmes informations.

- Les volumes, d'abord :
  - En France, l'ANSSI a traité 1 366 incidents en 2025, dont 128 attaques par rançongiciel majeures et 196 exfiltrations de données.
  - À l'échelle européenne, l'ENISA a analysé 4 875 incidents sur un an : la menace est de masse, permanente.
- Les usages, ensuite, là où l'IA change la donne :
  - Plus de 80 % du phishing est dopé à l'IA : l'ingénierie sociale est industrialisée.
  - La cible se démocratise : 48 % des victimes de rançongiciel sont des PME, des TPE, des ETI, plus seulement les grands groupes, parce que l'attaque automatisée coûte moins cher à lancer.
  - Les secteurs les plus touchés en France sont l'éducation-recherche (un tiers des incidents), puis les collectivités (un quart) et la santé, des cibles à fort impact et souvent sous-dotées.
  - Dernier point : l'ANSSI note un brouillage entre États et cybercriminels, les mêmes outils, les mêmes techniques, la frontière géopolitique s'efface.

---

## Slide 09, Partie III. Bâtir la résilience : le cadre réglementaire (NIS2, DORA)

**Ouverture.** J'entre dans ma troisième partie, construire la résilience, et le point de départ, c'est que ce n'est plus un choix : l'Europe l'impose par deux textes récents.

- La directive NIS2, en cours de transposition en France en 2025 :
  - Là où l'ancienne NIS ne visait que les opérateurs critiques, NIS2 couvre des milliers d'entités, classées essentielles ou importantes selon leur taille.
  - Elle exige des mesures à la fois techniques ET organisationnelles.
  - Elle impose un calendrier de notification strict à l'ANSSI : 24 heures pour la première alerte, 72 heures, puis 30 jours pour le rapport final.
  - Et, c'est nouveau, la responsabilité personnelle des dirigeants est engagée, jusqu'à 10 millions d'euros ou 2 % du chiffre d'affaires.
- Le règlement DORA, la résilience opérationnelle numérique, appliqué depuis janvier 2025 à plus de 22 000 entités financières :
  - Il impose des tests réguliers et la surveillance des sous-traitants informatiques, parce qu'une banque est aussi vulnérable que son fournisseur cloud.
  - Et une notification d'incident en 4 heures.

**Transition.** Ces deux textes actent un basculement de doctrine : on n'exige plus seulement d'empêcher, on exige de pouvoir encaisser et se rétablir.

---

## Slide 10, Sécuriser l'IA elle-même : AI Act et RGPD

**Ouverture.** La partie II a montré que l'IA elle-même est attaquable, et la bonne nouvelle, c'est que le droit vient précisément d'intégrer ça.

- L'AI Act, le règlement européen sur l'IA, classe les systèmes en quatre niveaux de risque, et les IA gérant une infrastructure critique sont classées haut risque.
- Son article 15 exige que ces systèmes atteignent un niveau approprié d'exactitude, de robustesse et de cybersécurité, et le texte parle explicitement de résistance à l'empoisonnement des données et aux exemples adverses : autrement dit, les attaques que je décrivais il y a deux minutes deviennent une non-conformité légale.
- Le tout entre en application complète le 2 août 2026, avec des sanctions jusqu'à 35 millions d'euros ou 7 % du chiffre d'affaires.
- Il ne faut pas oublier que le RGPD imposait déjà la sécurité : son article 32 exige des mesures techniques et organisationnelles appropriées, et l'article 33 la notification d'une fuite sous 72 heures.
- La fuite de l'ANTS, 11,7 millions de comptes exposés par une faille triviale, c'est le manquement type à cet article 32.
- Enfin, côté opérationnel, l'ANSSI a publié en avril 2024 un guide de 35 recommandations pour sécuriser une IA générative, le pont concret entre le droit et la technique.

---

## Slide 11, Leviers : techniques, organisationnels, juridiques

**Ouverture.** Ma problématique annonçait trois plans, je les traite donc frontalement, avec trois familles de leviers.

- Sur le plan technique :
  - Le socle aujourd'hui, c'est le Zero Trust, formalisé par le NIST : on ne fait plus confiance à personne par défaut, même à l'intérieur du réseau, on vérifie à chaque accès ; on l'associe à la défense en profondeur et au SOC augmenté par IA vu en partie I.
  - Comme l'IA est elle-même une cible, on ajoute le MLSecOps : filtrer les entrées et sorties du modèle, appliquer le moindre privilège, faire des tests adverses, exiger une validation humaine pour les actions sensibles, ce sont les recommandations de l'OWASP.
  - Enfin, le levier de résilience par excellence : le plan de reprise et de continuité d'activité, avec des sauvegardes immuables, c'est ce qui permet de dire non à un rançongiciel.
- Sur le plan organisationnel, celui qu'on oublie le plus :
  - La gouvernance : un RSSI, un DPO, un comité d'éthique de l'IA.
  - Les méthodes : l'analyse de risque EBIOS Risk Manager de l'ANSSI, l'analyse d'impact AIPD pour tout usage d'IA sensible, la classification des données.
  - Une politique d'usage de l'IA pour endiguer le shadow AI, et surtout de la formation : 70 % des DRH placent l'IA en tête des transformations de compétences, et sans exercices de crise réguliers, le meilleur outil ne sert à rien.
- Sur le plan juridique :
  - Transformer les obligations vues juste avant, NIS2, DORA, AI Act, RGPD, en une vraie feuille de route de conformité, et la répercuter sur les fournisseurs par contrat, via les clauses de sous-traitance de l'article 28 du RGPD.

**Transition.** Ces trois familles ne fonctionnent qu'ensemble : un pare-feu sans gouvernance, ou une charte sans technique, ne produit aucune résilience.

---

## Slide 12, Conclusion et ouverture

**Ouverture.** Je conclus en trois points.

- Premier point : oui, l'IA est un vrai multiplicateur de force pour la défense, le rapport IBM le chiffre à 1,9 million d'économie par violation et 80 jours de détection gagnés, on aurait tort de s'en priver.
- Deuxième point : mais la même IA arme l'attaquant, 80 % du phishing, des deepfakes qui coûtent 25 millions, et elle devient elle-même une surface d'attaque à protéger, c'est l'épée à double tranchant de mon fil rouge.
- Troisième point, ma réponse à la problématique : la résilience ne se décrète pas, elle naît de la convergence des trois plans, technique, organisationnel, juridique, sous le principe assume the breach, partir du principe qu'on sera pénétré et concevoir le SI pour tenir quand même.
- La question n'est plus si on sera attaqué, mais quand, et si le système tiendra.

**Ouverture au jury.** À mesure que défenseurs et attaquants s'équipent exactement de la même IA, est-ce que l'humain reste l'arbitre de cette course, ou est-ce qu'il en devient la variable d'ajustement ? Je vous remercie.

---

## Slide 13, Sources

**Ouverture.** Voici mes sources, organisées en institutionnel, études de marché, presse et référentiels techniques.

- La bibliographie détaillée, avec chaque chiffre et son lien, est disponible si vous souhaitez vérifier une donnée.
