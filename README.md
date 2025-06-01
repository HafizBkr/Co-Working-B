# Co-Workink-P

Co-Workink-P est une application collaborative de gestion d'espaces de travail, de projets et de communication en temps réel, conçue pour les équipes modernes.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Configuration](#configuration)
- [Architecture du projet](#architecture-du-projet)
- [Principaux modules](#principaux-modules)
- [API et routes](#api-et-routes)
- [Modèles de données](#modèles-de-données)
- [Dépendances](#dépendances)

---

## Fonctionnalités

- Authentification et gestion des utilisateurs
- Gestion des espaces de travail (workspaces)
- Invitations et gestion des membres
- Gestion de projets et de tâches
- Chat en temps réel par workspace
- Notifications et emails d'invitation

## Installation

1. Clone le dépôt :
   ```bash
   git clone <repo-url>
   cd Co_Workink-p
   ```
2. Installe les dépendances :
   ```bash
   npm install
   ```
3. Configure les variables d'environnement dans `.env`.
4. Lance le serveur en développement :
   ```bash
   npm run dev
   ```

## Configuration

- Pour MongoDB, encode les caractères spéciaux dans le mot de passe :
  | Caractère | Encodage URI |
  | --------- | ------------ |
  | `#`       | `%23`        |
  | `@`       | `%40`        |
  | `:`       | `%3A`        |
  | `/`       | `%2F`        |
  | `?`       | `%3F`        |
  | `=`       | `%3D`        |
  | `&`       | `%26`        |

## Architecture du projet

```
src/
  app.ts                // Configuration de l'app Express
  server.ts             // Point d'entrée du serveur
  configs/              // Configurations (MongoDB, variables)
  controllers/          // Logique métier des routes
  models/               // Schémas et interfaces Mongoose
  routes/               // Définition des routes Express
  services/             // Services métiers (email, chat, etc.)
  middleware/           // Middlewares Express
  repository/           // Accès aux données
  helpers/, utils/, validator/
```

## Principaux modules

- **Authentification** : `auth.ts`, JWT, gestion des utilisateurs.
- **Workspaces** : création, invitation, gestion des membres.
- **Projets & Tâches** : CRUD projets, gestion des tâches.
- **Chat** : messages, canaux, notifications temps réel (Socket.io).
- **Services** : envoi d'emails, gestion des invitations, etc.

## API et routes

- `/api/v1/auth` : Authentification (register, login, reset password, etc.)
- `/api/v1/workspaces` : Gestion des espaces de travail
- `/api/v1/invitations` : Invitations aux workspaces
- `/api/v1/projects` : Gestion des projets

## Modèles de données

- **User** : email, mot de passe, profil, etc.
- **Workspace** : nom, description, membres, etc.
- **Project** : nom, description, dates, workspace lié
- **Task** : titre, description, projet lié, statut, priorité
- **Chat/Message** : participants, contenu, workspace, etc.
- **Invitation** : email, workspace, rôle, statut

## Dépendances principales .

- express, mongoose, socket.io, jsonwebtoken, bcryptjs, nodemailer, dotenv, typescript

---

Pour plus de détails, consulte le code source de chaque dossier ou fichier spécifique.
