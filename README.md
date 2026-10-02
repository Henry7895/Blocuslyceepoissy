# BLOCUS LYCÉES POISSY

Plateforme statique d'information locale consacrée aux blocus et mobilisations lycéennes à Poissy.

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