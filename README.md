# Dream App

Application mobile de journal de rêves développée avec React Native et Expo. Elle permet d'enregistrer, consulter et filtrer ses rêves avec des informations détaillées.

---

## Lancer l'application

### Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) installé sur votre téléphone **OU** un émulateur Android/iOS configuré

### Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd dream-app

# Installer les dépendances
npm install
```

### Démarrage

```bash
# Lancer le serveur de développement
npm start
```

Un QR code s'affiche dans le terminal. Scannez-le avec l'application **Expo Go** sur votre téléphone.

Ou lancez directement sur une plateforme :

```bash
npm run android   # Émulateur Android
npm run ios       # Simulateur iOS (macOS uniquement)
npm run web       # Navigateur web
```

---

## Architecture et structure du projet

```
dream-app/
├── app/                        # Routes de l'application (Expo Router)
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Configuration de la navigation par onglets
│   │   ├── index.tsx           # Onglet 1 — Formulaire d'ajout de rêve
│   │   └── two.tsx             # Onglet 2 — Liste des rêves
│   ├── +html.tsx               # Template HTML (web)
│   └── +not-found.tsx          # Page 404
├── components/
│   ├── DreamForm.tsx           # Formulaire de saisie d'un rêve
│   ├── DreamList.tsx           # Liste avec filtres des rêves enregistrés
│   ├── Themed.tsx              # Composants Text/View avec support du thème
│   └── ...                     # Utilitaires (couleurs, schéma, polices)
├── constants/
│   └── Colors.ts               # Palette de couleurs (thème clair/sombre)
├── assets/                     # Images, icônes, polices
├── app.json                    # Configuration Expo
└── package.json
```

L'application utilise **Expo Router** (file-based routing) : chaque fichier dans `app/` correspond à une route. La navigation principale est une barre d'onglets en bas d'écran avec deux onglets.

La persistance des données est assurée par **AsyncStorage** : les rêves sont stockés localement sur l'appareil au format JSON, sans serveur ni base de données.

---

## Fonctionnalités et choix de conception

### Fonctionnalités implémentées

**Formulaire de rêve (`DreamForm`)**
- Description libre du rêve (champ texte multilignes)
- Date et heure du rêve (sélecteur natif)
- Lieu du rêve
- Personnes présentes (ajout/suppression dynamique)
- 3 hashtags pour les éléments principaux
- Humeur avant et après le rêve (Triste / Neutre / Content)
- Type de rêve : Cauchemar, Neutre ou Rêve
- Indicateur de rêve lucide (case à cocher)
- Évaluation par étoiles : clarté du rêve et qualité du sommeil (sur 5)
- Interprétation personnelle du rêve
- Mode édition : modification d'un rêve existant depuis la liste

**Liste des rêves (`DreamList`)**
- Affichage en cartes avec résumé des informations clés
- Mise en page responsive : 1, 2 ou 3 colonnes selon la taille de l'écran
- Suppression d'un rêve
- Modification d'un rêve (redirige vers le formulaire pré-rempli)
- Panneau de filtres combinables :
  - Par hashtag (recherche partielle)
  - Par personnage présent
  - Par type de rêve
  - Par humeur (avant ou après)
- Compteur de filtres actifs

### Choix de conception

**Expo Router** a été choisi pour son routage basé sur les fichiers, cohérent avec les conventions modernes React Native et facilitant la navigation avec paramètres (ex. `editIndex` pour l'édition).

**React Native Paper** fournit les composants UI (boutons, champs de saisie, cartes, chips) avec un design Material 3 cohérent et un support natif du thème clair/sombre.

**AsyncStorage** a été retenu pour la persistance locale, sans nécessiter de backend. Chaque rêve est identifié par un UUID généré avec `react-native-uuid`.

Le formulaire est **responsive** : sur les écrans larges (≥ 768 px), certains champs s'affichent côte à côte grâce à une détection de largeur via `useWindowDimensions`.
