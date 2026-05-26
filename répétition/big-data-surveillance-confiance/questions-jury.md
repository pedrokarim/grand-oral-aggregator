# Questions probables du jury — éléments de réponse sourcés

> **Pour la répétition du 28/05** : 1-2 questions max (le format laisse la place au debriefing).
> **Pour la soutenance finale du 28-29/09** : 20 minutes de Q&A — toutes ces questions seront pertinentes.

---

## 🔵 Questions de définition / fondamentaux

### Q1. « Pouvez-vous nous redéfinir précisément ce qu'est le Big Data ? »

Le Big Data correspond aux ensembles de données dont le volume, la vitesse de génération ou la variété dépassent les capacités des outils traditionnels (BDD relationnelles classiques). Le modèle des **5 V** est issu d'une note de Doug Laney chez META Group en 2001 — initialement 3 V (Volume, Vélocité, Variété), étendu à 5 V avec Véracité (qualité, fiabilité) et Valeur (utilité métier). Sources : **S25**.

### Q2. « Quelle différence entre RGPD et AI Act ? »

- **RGPD** (2016/679) : règlement sur les **données personnelles** — collecte, traitement, transfert. Applicable depuis le 25 mai 2018.
- **AI Act** (Règlement UE 2024/1689) : règlement sur les **systèmes d'intelligence artificielle**. Classification par niveau de risque (inacceptable / haut risque / risque limité / risque minimal). Entré en vigueur le 1ᵉʳ août 2024, application complète au 2 août 2026 (annexe III haut risque reportée au 2 décembre 2027).
- **Complémentarité** : un système d'IA qui traite des données personnelles doit respecter **les deux** règlements.

Sources : **S4, S6, S7**.

---

## 🔵 Questions sur les sanctions

### Q3. « Citez-moi des sanctions RGPD récentes marquantes. »

- **Meta — 1,2 milliard € (mai 2023)** : record européen, infligé par la DPC irlandaise pour transferts illégaux UE → US. Source : **S4**.
- **Amazon — 746 M€ (2021)** : sanction CNPD luxembourgeoise.
- **Bilan CNIL 2024** : 87 sanctions, 75 amendes, **55 M€** au total ; principal manquement = défaut de coopération (27 cas). Sources : **S1, S2**.

### Q4. « Comment est calculée une amende RGPD ? »

L'article 83 du RGPD prévoit que les autorités tiennent compte de la **gravité**, de la **durée**, du **caractère intentionnel ou négligent**, des **mesures prises** pour atténuer le dommage, du **degré de coopération** avec l'autorité et de **toute violation antérieure**. Plafond : **20 M€ ou 4 % du CA mondial annuel** (le plus élevé), **10 M€ ou 2 %** pour les manquements techniques. L'EDPB a publié des lignes directrices méthodologiques (04/2022) consacrant un calcul en cinq étapes basé sur le CA. Sources : **S4, S5**.

---

## 🔵 Questions techniques

### Q5. « Le Privacy by Design, concrètement, ça donne quoi ? »

Les **7 principes de Cavoukian** :
1. Proactif, pas réactif (prévenir, pas guérir)
2. Privacy par défaut
3. Privacy intégré à la conception
4. Fonctionnalité complète — somme positive, pas somme nulle
5. Sécurité de bout en bout du cycle de vie
6. Visibilité et transparence
7. Respect de la vie privée des utilisateurs

Intégré à **l'article 25 du RGPD**. Sources : **S27, S28**.

### Q6. « Federated Learning ou Differential Privacy, quelle différence ? »

- **Federated Learning** : on **n'agrège jamais les données brutes**. L'entraînement se fait localement sur l'appareil de l'utilisateur, et seuls les **poids du modèle** (ou leurs gradients) remontent au serveur. Limite : les gradients peuvent eux-mêmes fuiter de l'information (attaque par inversion).
- **Differential Privacy** : technique mathématique qui **ajoute du bruit calibré** aux statistiques agrégées pour qu'on ne puisse pas reconstruire un individu, avec une garantie quantifiée (le paramètre ε, *epsilon*). Limite : un epsilon élevé donne de fausses garanties ; un epsilon bas dégrade l'utilité statistique.
- **Les deux sont complémentaires** : Federated Learning + Differential Privacy sur les gradients = solide.

### Q7. « Comment fonctionne une faille IDOR comme celle de l'ANTS ? »

**IDOR** = *Insecure Direct Object Reference* (OWASP A01:2021 Broken Access Control). Le serveur expose des ressources via un identifiant numérique dans l'URL (`/profil/12345`), sans vérifier que l'utilisateur authentifié a le droit de voir le profil `12345`. Le pirate **itère sur l'identifiant** et aspire toute la base. Sur l'ANTS, c'est exactement ça : pas besoin de mot de passe, juste un script qui incrémente le numéro de profil. Source : **S19**.

---

## 🔵 Questions critiques / contre-arguments

### Q8. « Le RGPD est-il un échec, finalement ? »

Réponse en deux temps :
- **Non, ce n'est pas un échec** : il a imposé une discipline (registres, notifications, droits), augmenté la transparence (les violations sont visibles aujourd'hui alors qu'elles étaient cachées avant), et créé un écosystème (DPO, autorités, jurisprudence).
- **Mais ce n'est pas un succès complet non plus** : il n'a pas suffi à empêcher les fuites massives, parce que beaucoup d'organisations l'ont traité comme un exercice de **conformité documentaire** sans investir dans la sécurité opérationnelle. Un tiers des sanctions CNIL 2024 visait des manquements à l'obligation de sécurité.

Source : **S20**.

### Q9. « N'est-ce pas un peu naïf de croire à la "Privacy by Design" alors que tout le modèle économique des GAFAM repose sur l'inverse ? »

C'est une excellente objection. Trois éléments de réponse :
1. La question n'est pas binaire : on n'attend pas que les plateformes deviennent vertueuses, on **contraint réglementairement** leur architecture (Digital Markets Act, Digital Services Act, AI Act).
2. Les acteurs qui font de la Privacy by Design un **argument commercial** émergent (DuckDuckGo, ProtonMail, Signal, Apple sur certains aspects). Le marché commence à valoriser.
3. Pour le secteur public et les acteurs européens, le RGPD + AI Act créent un **différentiel de coût** entre conformité native et rattrapage. La Privacy by Design devient économiquement rationnelle.

### Q10. « La surveillance n'est-elle pas devenue nécessaire face au terrorisme et à la cybercriminalité ? »

Question piège classique. Position équilibrée :
- Oui, certaines formes de surveillance sont **proportionnées** à des menaces réelles — par exemple le ciblage individuel sur autorisation judiciaire.
- Mais le passage de la surveillance ciblée à la surveillance de masse n'est **ni nécessaire ni proportionné** au sens de la jurisprudence de la **CEDH** et de la **CJUE** (arrêts *Schrems I* et *II*, jurisprudence sur la conservation généralisée des données).
- C'est exactement ce qui a justifié l'invalidation du **Privacy Shield** UE-US en 2020 : l'accès massif des autorités américaines aux données européennes était incompatible avec le droit fondamental à la vie privée.

### Q11. « Pourquoi parler de Snowden et Cambridge Analytica, des affaires vieilles de 8-13 ans ? »

Trois raisons :
1. Ce sont des **cas pédagogiques canoniques** — leur clarté facilite la transmission du raisonnement.
2. Ils ont **structuré la réglementation actuelle** : le RGPD a été finalisé après Snowden, l'invalidation du Safe Harbor (arrêt Schrems) en découle directement.
3. Les **mécanismes** qu'ils illustrent (accès direct aux serveurs, friend graph) sont toujours opérants — seuls les acteurs et les noms changent.

Si on veut un exemple récent : **piratage de l'ANTS d'avril 2026** (11,7 M comptes) ; **Centre des monuments nationaux** (ransomware avril 2026). Sources : **S19, S20**.

---

## 🔵 Questions « ouverture / réflexion »

### Q12. « Si vous deviez retenir UNE mesure pour reconstruire la confiance, ce serait laquelle ? »

La **transparence par défaut** des traitements algorithmiques affectant les citoyens — c'est-à-dire l'obligation, pour tout système qui prend ou aide à prendre une décision sur un individu (crédit, recrutement, assurance, justice), d'exposer publiquement :
- Les **données d'entrée** utilisées
- La **logique** appliquée (au moins à un niveau intelligible)
- Les **voies de recours**

C'est l'esprit de l'article 22 du RGPD sur les décisions automatisées, considérablement renforcé par les obligations de transparence de l'AI Act sur les systèmes à haut risque.

### Q13. « Quels sont les 5 prochains débats à venir sur Big Data / surveillance ? »

1. **L'identité numérique européenne** (wallet eIDAS 2) : nouveau standard mais aussi nouveau point de surveillance centralisé.
2. **Les agents IA** : qui est responsable quand un agent autonome agit en mon nom et utilise mes données ?
3. **Le chiffrement de bout en bout sous pression** : *Chat Control* au Parlement européen, scan client-side proposé puis retiré, à suivre.
4. **Les modèles d'IA entraînés sur du contenu personnel** : opt-in vs opt-out, droit à l'oubli appliqué aux poids des modèles.
5. **La surveillance algorithmique au travail** : pilotage par KPI, time tracking par IA, productivité mesurée en continu.

---

## Stratégie face à une question piège

- **Reformuler** la question avant de répondre (« Si je comprends bien, vous me demandez si... »). Gagne du temps + montre l'écoute active.
- Si on ne sait pas : **« C'est une excellente question. Honnêtement, je n'ai pas la réponse précise, mais je peux vous donner ma piste de réflexion : ... »**. Bien mieux que d'inventer.
- Toujours **ramener à un cas concret** ou un chiffre du deck. Ancre l'expertise.
