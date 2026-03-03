# Family Calendar - Application de gestion de calendrier familial

## Description

Family Calendar est une application web responsive conçue pour la gestion collaborative du calendrier familial. Elle permet à tous les membres d'une famille de suivre les événements, anniversaires, jours fériés et autres rendez-vous importants.

## Fonctionnalités

- **Calendrier interactif** : Visualisation mensuelle, hebdomadaire et journalière
- **Gestion des événements** : Création, modification et suppression d'événements familiaux
- **Système d'authentification** : Différents rôles (membre, administrateur, super-admin)
- **Notifications** : Alertes pour les événements à venir et les validations requises
- **Gestion des membres** : Invitation et gestion des membres de la famille
- **Suivi des disponibilités** : Indication de la disponibilité pour chaque événement
- **Interface multilingue** : Prise en charge du français

## Technologies utilisées

- **Frontend** : Next.js 16.1.5, React 18.3.1
- **Styling** : Tailwind CSS, shadcn/ui
- **Gestion des dates** : date-fns
- **Icons** : Lucide React
- **Authentification** : better-auth
- **Animations** : Framer Motion
- **Gestion des formulaires** : react-hook-form
- **Validation** : Zod

## Installation

1. Clonez le dépôt :
```bash
git clone <url_du_depot>
cd Family-Calendar
```

2. Installez les dépendances :
```bash
npm install
```

3. Démarrez le serveur de développement :
```bash
npm run dev
```

L'application sera disponible à l'adresse http://localhost:3000

## Structure du projet

```
src/
├── app/                 # Pages de l'application (routing Next.js 13+)
├── components/          # Composants UI réutilisables
│   ├── layout/          # Composants de mise en page
│   └── ui/              # Composants UI de base
├── context/             # Contextes React (ex: AuthContext)
├── hooks/               # Hooks personnalisés
├── lib/                 # Fonctions utilitaires
├── types/               # Définitions TypeScript
```

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables nécessaires :
```
NEXT_PUBLIC_API_URL=
DATABASE_URL=
```

## Déploiement

Pour produire une version optimisée de l'application :
```bash
npm run build
npm start
```

## Contribution

Les contributions sont les bienvenues ! Veuillez d'abord ouvrir un ticket pour discuter des modifications que vous souhaitez apporter.

## Licence

Ce projet est une démonstration pour Tech Bloom Agency Madagascar.