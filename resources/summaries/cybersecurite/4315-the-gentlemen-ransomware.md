---
id: 4315
slug: the-gentlemen-worm-fahige-ransomware-mit-478-opfern-russischer-betreiber-identif
theme: Cybersecurité
title: The Gentlemen : un ransomware à propagation automatique avec 478 victimes
source: BLOGSPAN.NET
url: https://www.blogspan.net/the-gentlemen-ransomware-worm-betreiber/
publishedAt: 2026-06-11T17:18:00
provider: anthropic
model: claude-opus-4-8
---
## Résumé

(Article en allemand.) En 15 mois, le ransomware **The Gentlemen** est devenu la **2e opération de ransomware la plus prolifique de 2026** avec **478 victimes dans 66 pays**. Les sociétés **PRODAFT** (qui suit le groupe sous le nom *Phantom Mantis*) et **Krebs on Security** ont identifié l'opérateur présumé : un responsable marketing IT russe de 36 ans, basé à Ijevsk.

## Points clés

- Logiciel écrit en **Go**, obfusqué, fonctionnant sur **Windows, Linux, ESXi** ; l'argument `--spread` le transforme en **ver auto-propagateur** (worm).
- Modèle **RaaS** agressif : **90 % du butin** aux affiliés (vs 80 % standard) → recrutement facilité ; accès au panel conditionné à **1 Go** de données exfiltrées.
- Points d'entrée : équipements **edge exposés** — VPN **FortiGate** par force brute, appliances **Cisco**, infrastructure **VMware**. Délai moyen accès→chiffrement : **2 à 6 semaines**.
- Cibles principales : Royaume-Uni, Brésil, Thaïlande, **Allemagne**, Inde ; seulement **~13 % de victimes américaines** (choix délibéré pour limiter la réaction FBI/DOJ).

## Problématique pour le Grand Oral

Comment le modèle **Ransomware-as-a-Service** industrialise-t-il la cybercriminalité, et pourquoi les **accès VPN mal protégés** restent-ils la porte d'entrée privilégiée des attaquants ?

## Analyse

Le cas est exemplaire de la **professionnalisation** du ransomware : modèle économique (RaaS, partage 90/10), marque publique, division du travail reconstituée à partir de messages internes fuités. La fonction **worm** marque une montée en dangerosité (propagation autonome). Le constat opérationnel est clé : la voie d'entrée n'est pas sophistiquée mais banale — **VPN sans MFA** et identifiants faibles. La faible part de victimes US révèle un **calcul géopolitique** (les groupes russophones évitent les cibles susceptibles de déclencher une réponse américaine forte). L'identification nominative de l'opérateur montre la puissance de l'**OSINT**.

## Pertinence Grand Oral

Riche pour les sujets **ransomware, RaaS, hygiène cyber (MFA/VPN)** et **géopolitique de la cybercriminalité**. Données très concrètes (478 victimes, 90 %, FortiGate) et angle « la faille humaine/config » mobilisable comme argument.
