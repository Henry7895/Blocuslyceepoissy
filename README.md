# Blocus Lycées Poissy

Blocus Lycées Poissy est un site d’information consacré aux blocus et mobilisations dans les lycées de Poissy et des alentours.

Le site permet de retrouver des informations sur les blocus, leur contexte, les établissements concernés et les événements associés, avec une interface moderne, simple et accessible sur ordinateur comme sur mobile.

- 🎓 Informations sur les lycées
- 📢 Actualités et blocus
- 📍 Établissements concernés
- 📰 Informations et ressources
- 📱 Interface responsive

Projet indépendant réalisé dans le but de centraliser et de rendre facilement accessibles les informations concernant les mobilisations lycéennes à Poissy.

## Architecture

- HTML statique compatible GitHub Pages
- CSS moderne, responsive et mobile-first
- JavaScript vanilla sans dépendance externe
- Données séparées dans data/*.json
- Pages dédiées pour Le Corbusier et Charles-de-Gaulle
- Recherche globale et filtres
- Mode sombre par défaut avec préférence mémorisée
- Animations respectueuses de prefers-reduced-motion
- Déploiement GitHub Pages via GitHub Actions

## Modifier les informations

Les contenus éditoriaux se trouvent dans :

- data/schools.json
- data/blocus.json
- data/news.json

Aucune donnée d'événement fictive n'est publiée comme réelle. En l'absence de confirmation, l'interface affiche explicitement un état comme « À confirmer » ou « Non communiqué ».

## Déploiement

Le workflow .github/workflows/pages.yml publie automatiquement le site sur GitHub Pages à chaque modification de la branche main.

Le site reste un site indépendant d'information et ne représente pas les établissements concernés.
