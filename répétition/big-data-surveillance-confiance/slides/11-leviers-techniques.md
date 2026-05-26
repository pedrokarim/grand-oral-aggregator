# Slide 11 — Leviers techniques et de gouvernance

> Durée cible : 1 min 30 · Type : ouverture solutions

## Contenu visible

### Techniques (le « comment »)

- **Privacy by Design / by Default** — art. 25 du RGPD, 7 principes d'Ann Cavoukian
- **Minimisation** : collecter strictement ce qui est nécessaire
- **Chiffrement de bout en bout** — TLS, AES, chiffrement de la base
- **Federated Learning** : entraîner les modèles **sans déplacer** les données
- **Differential Privacy** : bruiter les statistiques pour empêcher la ré-identification

### Gouvernance (le « par qui »)

- **DPO obligatoire** dans le secteur public et au-dessus de 250 salariés
- Mais : **90 %** des entreprises **sans cadre public de gouvernance IA**, **13 %** seulement avec supervision humaine *(Fondation Thomson Reuters / UNESCO, AICDI ~3 000 entreprises, 11 secteurs)*

## Notes orales

> *« Si on veut reconstruire la confiance, il faut combiner deux familles de leviers : les leviers techniques, et les leviers de gouvernance. »*

> *« Sur le plan technique, le cadre de référence est le Privacy by Design — la protection des données dès la conception — formalisé dans les années 90 par Ann Cavoukian, ancienne Commissaire à l'information de l'Ontario. Ses sept principes ont été intégrés à l'article 25 du RGPD. Concrètement, cela veut dire : minimiser la collecte, chiffrer par défaut, anonymiser dès que possible, et concevoir l'architecture comme si la fuite était certaine. »* (S27, S28)

> *« Deux techniques émergentes méritent qu'on en parle. Le **Federated Learning**, popularisé par Google en 2017 : on entraîne un modèle d'IA sans jamais centraliser les données — chaque appareil entraîne localement, et seuls les poids du modèle remontent. C'est ce qui permet par exemple à Gboard d'apprendre votre style sans envoyer vos textes à Google. Et la **Differential Privacy** : on ajoute du bruit statistique aux résultats agrégés, de manière à garantir mathématiquement qu'on ne peut pas remonter à un individu. Apple et l'INSEE l'utilisent. »*

> *« Sur le plan de la gouvernance, le RGPD a imposé le DPO — délégué à la protection des données — dans le secteur public et au-delà de 250 salariés. Mais une étude récente de la Fondation Thomson Reuters et de l'UNESCO, qui couvre près de 3 000 entreprises dans 11 secteurs, montre que 90 % des entreprises n'ont aucun cadre public de gouvernance pour leur IA. Seules 13 % déclarent une supervision humaine de leurs systèmes. Donc on a un trou béant entre le droit et la pratique. »* (S23)

## Astuce de scène

- Ne pas survendre Federated Learning ou Differential Privacy : ce sont des techniques **complémentaires**, pas des silver bullets. Si le jury insiste, savoir reconnaître leurs limites (cf. questions-jury.md).
- L'art. 25 du RGPD est **rarement cité** dans les copies : le citer = différenciation.
- Le chiffre 90 % vs 13 % est très parlant, à dire en **opposition** pour qu'il claque.

## Sources

- S23 — L'Usine Digitale / Thomson Reuters / UNESCO : 90 % sans gouvernance IA
- S27 — Ann Cavoukian : 7 principes Privacy by Design
- S28 — RGPD, article 25 : Privacy by Design / by Default
