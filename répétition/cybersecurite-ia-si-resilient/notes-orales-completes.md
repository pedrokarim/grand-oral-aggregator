# Grand Oral, Cybersécurité et IA : notes orales complètes

> Document de répétition (format prompteur). Toutes les notes orales des 13 slides sujet, regroupées.
> Durée cumulée du texte parlé : environ 16 min 50 (partie sujet, hors 5 min projet pro).
> Texte verbatim, non modifié. Les repères (S6, S2...) renvoient à `sources.md` si le jury demande une vérification.

---

## Slide 01, Titre
*Durée : 0 min 10*

« Bonjour, je m'appelle Karim, je suis étudiant en Master Informatique au CESI, filière Manager le SI. Le sujet que je vais traiter est : "Cybersécurité et IA, l'avenir d'un SI résilient". Je vais l'aborder du point de vue d'un manager du système d'information, c'est-à-dire quelqu'un qui doit à la fois exploiter l'IA pour se défendre, en anticiper les usages offensifs, et garantir que le SI continue de fonctionner même sous attaque. »

---

## Slide 02, Problématique et plan
*Durée : 1 min*

« Avant d'entrer dans le sujet, je pose ma problématique, parce que c'est elle qui tient tout le fil. L'IA est en train de transformer la cybersécurité, mais des deux côtés à la fois. Ma question est donc : comment un manager du SI peut faire de l'IA un levier de résilience, plutôt qu'un nouveau facteur de risque, et cela sur trois plans indissociables : technique, organisationnel et juridique. »

« Pour y répondre, je procède en trois temps. D'abord, je montre ce que l'IA apporte concrètement à la défense, c'est le bouclier. Ensuite, je montre le revers : la même IA arme les attaquants, et devient elle-même une surface d'attaque. Enfin, je propose les leviers qui permettent de construire un SI résilient, pas seulement sécurisé, mais capable d'encaisser et de se rétablir. »

« Le mot-clé de ma soutenance, c'est "résilience" : on verra qu'on ne peut plus tout empêcher, donc l'enjeu devient de tenir malgré l'attaque. »

---

## Slide 03, Accroche
*Durée : 1 min*

« Trois faits pour planter le décor, et ils racontent tous la même histoire. Premier fait : selon le rapport IBM Cost of a Data Breach 2025, les organisations qui utilisent massivement l'IA et l'automatisation en défense économisent 1,9 million de dollars par violation, et détectent les attaques 80 jours plus tôt. L'IA, c'est donc un vrai bouclier. » (S6)

« Deuxième fait : selon l'ENISA, l'agence européenne de cybersécurité, plus de 80 % des e-mails de phishing analysés fin 2024 utilisaient l'IA pour être rédigés ou personnalisés. La même technologie sert donc l'attaquant. » (S2)

« Troisième fait, le plus spectaculaire : en 2024, un employé du cabinet d'ingénierie Arup à Hong Kong a viré 25,6 millions de dollars après une visioconférence, où tous ses interlocuteurs, y compris le directeur financier, étaient des deepfakes générés par IA. » (S14)

« Bouclier, arme, et illusion parfaite : voilà l'épée à double tranchant. C'est pourquoi la question n'est plus seulement "comment empêcher", mais "comment rester debout", la résilience. »

---

## Slide 04, Définitions clés
*Durée : 1 min 30*

« Trois définitions pour parler la même langue que le jury. »

« La cybersécurité, d'abord. Ce n'est pas que de la technique : c'est l'ensemble des moyens techniques, organisationnels et humains qui protègent trois propriétés, la confidentialité, l'intégrité et la disponibilité des données. On appelle ça la triade CIA, c'est le socle des normes ISO 27000 et de la doctrine de l'ANSSI. » (S8)

« L'IA en cybersécurité, ensuite. Concrètement, c'est du machine learning. On distingue deux familles : l'apprentissage supervisé, qui apprend à reconnaître des menaces déjà connues à partir d'exemples étiquetés ; et l'apprentissage non supervisé, qui repère ce qui sort de l'ordinaire, l'anomalie, sans savoir à l'avance à quoi elle ressemble. C'est cette seconde famille qui détecte les attaques inédites. »

« Enfin, le SI résilient, le cœur de mon sujet. La résilience, c'est la capacité à anticiper, résister, se rétablir et s'adapter. La nuance est capitale : la sécurité cherche à empêcher l'attaque ; la résilience part du principe qu'une partie passera quoi qu'il arrive, et organise la continuité du service. C'est la logique du référentiel NIST Cybersecurity Framework version 2, avec ses fonctions gouverner, identifier, protéger, détecter, répondre, se rétablir. » (S18)

---

## Slide 05, Partie I. L'IA, bouclier : la cyberdéfense augmentée
*Durée : 1 min 30*

« Je commence par le côté lumineux, parce qu'il est réel et massif. »

« Le chiffre le plus parlant vient du rapport IBM 2025 : une organisation qui déploie largement l'IA et l'automatisation en défense paie en moyenne 3,6 millions de dollars par violation, contre 5,5 millions pour celles qui ne le font pas. Soit 1,9 million d'économie. Et surtout, elle détecte et contient l'attaque environ 80 jours plus vite. Or en cybersécurité, le temps, c'est tout : plus une intrusion dure, plus elle coûte. » (S6)

« Concrètement, où l'IA agit-elle ? Dans le centre opérationnel de sécurité, le SOC. Le SIEM, Security Information and Event Management, collecte les journaux ; couplé à de l'UEBA, User and Entity Behavior Analytics, il apprend le comportement normal de chaque utilisateur et lève une alerte quand quelqu'un se connecte à 3 h du matin depuis un autre pays et télécharge toute une base. Le SOAR, Security Orchestration, Automation and Response, automatise ensuite la réaction avec des playbooks : isoler le poste, bloquer l'adresse, sans attendre un humain. Et les solutions EDR puis XDR corrèlent ces signaux sur les postes, le réseau et le cloud. »

« L'IA ne remplace pas l'analyste : elle fait le tri dans le déluge d'alertes pour qu'il se concentre sur les vraies. C'est un multiplicateur de force. C'est pour ça que le marché de l'IA en cybersécurité passe d'environ 26 à 86 milliards de dollars. » (S9)

---

## Slide 06, La bascule : l'IA change de camp
*Durée : 1 min 15 (transition I vers II)*

« On vient de voir l'IA comme bouclier. Le problème, c'est qu'un outil n'a pas de camp. Le machine learning qui repère une anomalie pour le défenseur est exactement celui qui apprend à la maquiller pour l'attaquant. La cybersécurité devient donc une course symétrique, où les deux camps s'équipent des mêmes armes. »

« Et cette symétrie a un effet redoutable : elle fait s'effondrer la barrière à l'entrée. Avant, monter une campagne de phishing crédible en français sans faute demandait du temps et des compétences. Aujourd'hui, un modèle de langage le fait en quelques secondes, à l'échelle industrielle, personnalisé pour chaque victime. On n'a plus besoin d'être un expert pour lancer une attaque sophistiquée. »

« C'est exactement le point de bascule de ma soutenance : je passe donc du bouclier à l'épée. Voyons maintenant, très concrètement, comment l'IA réarme l'attaquant, et comment elle devient elle-même une cible. »

---

## Slide 07, Partie II. L'IA, arme et l'IA vulnérable
*Durée : 2 min*

« Le revers a deux volets, et on oublie souvent le second. »

« Premier volet : l'IA comme arme. L'ENISA confirme que plus de 80 % des e-mails de phishing sont désormais rédigés ou personnalisés par IA. Il existe même des modèles de langage conçus pour le crime, WormGPT, FraudGPT, vendus sur des forums, sans les garde-fous de ChatGPT. Ajoutez les deepfakes : c'est le cas Arup, 25,6 millions de dollars détournés parce que le directeur financier en visio était un faux généré par IA. Et des services de renseignement, la Chine, l'Iran, la Corée du Nord, utilisent des IA grand public pour de la reconnaissance et de la génération de code. » (S2, S14)

« Deuxième volet, plus subtil : quand une organisation déploie de l'IA, cette IA devient elle-même une cible. On peut empoisonner ses données d'entraînement pour la corrompre. On peut la tromper avec des exemples adverses, des entrées calculées pour lui faire prendre un malware pour un fichier sain. Et pour les IA génératives, il y a l'injection de prompt : l'OWASP la classe risque numéro 1 de sa liste 2025 pour les applications LLM. Sans compter le "shadow AI", les salariés qui utilisent des IA non validées : IBM chiffre ça à 670 000 dollars de surcoût par violation. » (S3, S13, S6)

« Autrement dit : sécuriser AVEC l'IA ne suffit pas, il faut aussi sécuriser l'IA. »

---

## Slide 08, Panorama chiffré de la menace 2025
*Durée : 2 min (slide la plus dense, lire en deux temps)*

« Cette slide est la plus dense, alors je la lis en deux temps distincts : d'abord des volumes, ensuite des usages, parce que ce ne sont pas les mêmes informations. »

« Les volumes, d'abord. En France, l'ANSSI a traité 1 366 incidents en 2025, dont 128 attaques par rançongiciel majeures et 196 exfiltrations de données. À l'échelle européenne, l'ENISA a analysé 4 875 incidents sur un an. Ce sont des ordres de grandeur : la menace est de masse, permanente. » (S1, S2)

« Les usages, ensuite, c'est là que l'IA change la donne. Plus de 80 % du phishing est dopé à l'IA : l'ingénierie sociale est industrialisée. Deuxième usage structurant : la cible se démocratise. 48 % des victimes de rançongiciel sont des PME, des TPE, des ETI, plus seulement les grands groupes, parce que l'attaque automatisée coûte moins cher à lancer. Enfin, les secteurs les plus touchés en France sont l'éducation-recherche, un tiers des incidents, puis les collectivités, un quart, et la santé. Ce sont des cibles à fort impact et souvent sous-dotées en cybersécurité. » (S1)

« Un dernier point qualitatif : l'ANSSI note un brouillage entre États et cybercriminels, les mêmes outils, les mêmes techniques. La frontière géopolitique s'efface. »

---

## Slide 09, Partie III. Bâtir la résilience : le cadre réglementaire (NIS2, DORA)
*Durée : 1 min 45*

« J'entre dans ma troisième partie : construire la résilience. Et le point de départ, c'est que ce n'est plus un choix, l'Europe l'impose par deux textes récents. »

« Le premier, c'est la directive NIS2, en cours de transposition en France en 2025. Elle élargit énormément le périmètre : là où l'ancienne NIS ne visait que les opérateurs critiques, NIS2 couvre des milliers d'entités, classées "essentielles" ou "importantes" selon leur taille. Ce qui est intéressant pour un manager du SI, c'est qu'elle exige des mesures à la fois techniques ET organisationnelles, et qu'elle impose un calendrier de notification strict à l'ANSSI : 24 heures pour la première alerte, 72 heures, puis 30 jours pour le rapport final. Et surtout, c'est nouveau, la responsabilité personnelle des dirigeants est engagée, avec des sanctions jusqu'à 10 millions d'euros ou 2 % du chiffre d'affaires. » (S3)

« Le second texte, c'est DORA, le règlement sur la résilience opérationnelle numérique, appliqué depuis janvier 2025 à plus de 22 000 entités financières. Le mot est dans le titre : résilience. DORA impose des tests réguliers, la surveillance des sous-traitants informatiques, parce qu'une banque est aussi vulnérable que son fournisseur cloud, et une notification d'incident en 4 heures. » (S7)

« Ces deux textes actent un basculement de doctrine : on n'exige plus seulement d'empêcher, on exige de pouvoir encaisser et se rétablir. »

---

## Slide 10, Sécuriser l'IA elle-même : AI Act et RGPD
*Durée : 1 min 30*

« La partie II a montré que l'IA elle-même est attaquable. La bonne nouvelle, c'est que le droit vient précisément d'intégrer ça. »

« L'AI Act, le règlement européen sur l'IA, classe les systèmes en quatre niveaux de risque. Ce qui m'intéresse ici, c'est que les IA gérant une infrastructure critique sont classées "haut risque". Et son article 15 exige que ces systèmes atteignent un niveau approprié d'exactitude, de robustesse et de cybersécurité, le texte parle explicitement de résistance à l'empoisonnement des données et aux exemples adverses. Autrement dit, les attaques que je décrivais il y a deux minutes deviennent une non-conformité légale. Le tout entre en application complète le 2 août 2026, avec des sanctions jusqu'à 35 millions d'euros ou 7 % du chiffre d'affaires. » (S4, S5)

« Et il ne faut pas oublier que le RGPD imposait déjà la sécurité : son article 32 exige des mesures techniques et organisationnelles appropriées, et l'article 33 la notification d'une fuite sous 72 heures. La fuite de l'ANTS, avec ses 11,7 millions de comptes exposés par une faille triviale, c'est le manquement type à cet article 32. » (S6bis, S19)

« Enfin, côté opérationnel, l'ANSSI a publié en avril 2024 un guide de 35 recommandations pour sécuriser une IA générative, le pont concret entre le droit et la technique. » (S17)

---

## Slide 11, Leviers : techniques, organisationnels, juridiques
*Durée : 2 min (les 3 familles, obligatoires)*

« Ma problématique annonçait trois plans : je les traite donc frontalement, avec trois familles de leviers. »

« Sur le plan technique, le socle aujourd'hui, c'est le Zero Trust, formalisé par le NIST : on ne fait plus confiance à personne par défaut, même à l'intérieur du réseau, on vérifie à chaque accès. On l'associe à la défense en profondeur et au SOC augmenté par IA qu'on a vu en partie I. Et comme l'IA est elle-même une cible, on ajoute une discipline émergente, le MLSecOps : filtrer les entrées et sorties du modèle, appliquer le moindre privilège, faire des tests adverses, et exiger une validation humaine pour les actions sensibles, ce sont les recommandations de l'OWASP. Enfin, le levier de résilience par excellence : le plan de reprise et de continuité d'activité, avec des sauvegardes immuables. C'est ce qui permet de dire non à un rançongiciel. »

« Sur le plan organisationnel, celui qu'on oublie le plus, la résilience se joue sur la gouvernance : un RSSI, un DPO, un comité d'éthique de l'IA. Des méthodes : l'analyse de risque EBIOS Risk Manager de l'ANSSI, l'analyse d'impact AIPD pour tout usage d'IA sensible, la classification des données. Une politique d'usage de l'IA pour endiguer le shadow AI. Et surtout de la formation : 70 % des DRH placent l'IA en tête des transformations de compétences ; sans exercices de crise réguliers, le meilleur outil ne sert à rien. » (S12, S15)

« Et sur le plan juridique, l'enjeu est de transformer les obligations vues juste avant, NIS2, DORA, AI Act, RGPD, en une vraie feuille de route de conformité, et de la répercuter sur les fournisseurs par contrat, via les clauses de sous-traitance de l'article 28 du RGPD. »

« Ces trois familles ne fonctionnent qu'ensemble : un pare-feu sans gouvernance, ou une charte sans technique, ne produit aucune résilience. »

---

## Slide 12, Conclusion et ouverture
*Durée : 1 min*

« Je conclus en trois points. Premier point : oui, l'IA est un vrai multiplicateur de force pour la défense, le rapport IBM le chiffre à 1,9 million d'économie par violation et 80 jours de détection gagnés. On aurait tort de s'en priver. »

« Deuxième point : mais la même IA arme l'attaquant, 80 % du phishing, des deepfakes qui coûtent 25 millions, et elle devient elle-même une surface d'attaque qu'il faut protéger. C'est l'épée à double tranchant de mon fil rouge. »

« Troisième point, et c'est ma réponse à la problématique : la résilience ne se décrète pas. Elle naît de la convergence des trois plans, technique, organisationnel, juridique, sous un principe qu'on résume par "assume the breach" : partir du principe qu'on sera pénétré, et concevoir le SI pour tenir quand même. La question n'est plus SI on sera attaqué, mais QUAND, et si le système tiendra. »

« Je terminerai par une question ouverte : à mesure que défenseurs et attaquants s'équipent exactement de la même IA, est-ce que l'humain reste l'arbitre de cette course, ou est-ce qu'il en devient la variable d'ajustement ? Je vous remercie. »

---

## Slide 13, Sources
*Durée : 0 min 10*

« Voici mes sources, organisées en institutionnel, études de marché, presse et référentiels techniques. La bibliographie détaillée, avec chaque chiffre et son lien, est disponible si vous souhaitez vérifier une donnée. »

---

*Bibliographie complète et vérifiée : `sources.md`. Astuces de scène par slide : dans chaque fichier `slides/NN-*.md`, section « Astuce de scène ».*
