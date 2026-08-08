# SnapFlam Restore

Site mobile minimaliste pour préparer une demande de restauration de flammes Snapchat.

## Fonctionnalités

- Authentification et inscription.
- Profil utilisateur avec email, ID Snapchat et numéro de téléphone.
- Gestion d’une liste d’amis avec leur ID Snapchat.
- Préparation d’une demande de restauration sur le formulaire officiel Snapchat.
- Design simple, mobile-first et adapté à l’ajout à l’écran d’accueil.

## Installation

1. Copiez `.env.example` en `.env`.
2. Remplissez `DATABASE_URL` avec votre connexion Neon.
3. Remplacez `JWT_SECRET` par une chaîne secrète.
4. Installez les dépendances :

```bash
npm install
```

5. Générez Prisma :

```bash
npm run prisma:generate
```

6. Appliquez la migration Prisma :

```bash
npm run prisma:migrate
```

7. Lancez le projet :

```bash
npm run dev
```

## Utiliser avec GitHub

- Initialisez un dépôt Git :

```bash
git init
git add .
git commit -m "Initial commit"
```

- Créez un dépôt GitHub puis poussez :

```bash
git remote add origin https://github.com/<votre-utilisateur>/<votre-repo>.git
git branch -M main
git push -u origin main
```

## Notes

- La route `/api/restore` prépare les données localement et ouvre le formulaire Snapchat officiel.
- Pour un déploiement, configurez `DATABASE_URL` sur le projet et `JWT_SECRET` en variable d’environnement.
