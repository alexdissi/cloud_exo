## Project Cloud Alexandre Dissi 

### Mastere Dev C - 2024
[image](public/screen.png)

#### 1. Introduction
Le but de se projet est de mettre en place une plateforme qui permet de creer des machines virtuelles sur le cloud uniquement si l'on est connecté à l'application via un login et un mot de passe.

Pour se faire nous allons utiliser les technologies suivantes :

- Next.js
- Azure API
- Tailwind
- NextAuth.js

#### 2. Prérequis

Apres avoir telecharger le projet au format ZIP sur pepal 

Une fois le projet téléchargé, il faut installer le package manager pnpm que j'ai utilisé pour mon projet :
Suivre ce tuto :

https://pnpm.io/installation

Il faut ensuite se rendre dans le dossier du projet :

```bash
cd cloud_exo
```

Ensuite il faut installer les dépendances du projet  :

```bash
pnpm install
```

Cela va installer toutes les dependance necessaire au projet pour fonctionner.

A la suite de cela creer un fichier environnement a la racine du projet avec la commande suivante
    
```bash
touch .env
```

Dans ce fichier .env ajouter les variables d'environnement suivantes :

```bash
NEXTAUTH_SECRET=
NEXTAUTH_URL=
AZURE_CLIENT_ID=
AZURE_TENANT_ID=
AZURE_CLIENT_SECRET=
AZURE_SUBSCRIPTION_ID=
```

Ajouter vos identifiants Azure dans les variables d'environnement.

Pour la variable NEXTAUTH_SECRET vous pouvez generer une clé en utilisant la commande suivante :

```bash
openssl rand -base64 32
```
**TRES IMPORTANT DE BIEN GENERER LA CLE NEXTAUTH_SECRET CAR CELLE CI EST UTILISE POUR CHIFFRER LES COOKIES DE SESSION.**

Copier la clé générée et coller la dans la variable d'environnement NEXTAUTH_SECRET.

Ensuite remplisser la variable NEXTAUTH_URL avec l'url de votre application.

```bash
NEXTAUTH_URL=http://localhost:3000
```

#### 3. Lancement du projet

Pour lancer le projet il suffit de taper la commande suivante :

```bash
pnpm dev
```

Cela va lancer le projet sur le port 3000.

Pour acceder à l'application il suffit de se rendre sur l'url suivante :

```bash
http://localhost:3000
```

#### 4. Fonctionnement de l'application

Une fois sur la plateforme , elle est tres simple d'utilisation.
Rendez vous sur le bouton login en haut a droite de la page et connectez vous avec un des identifiants suivants :

```bash
user1 : {
    email:"test@sfr.com",
    password:"test",
    role:"user"
},
user2:  {
    email:"test2@sfr.com",
    password:"test",
    role:"freemium"
},
user3:  {
    email:"test3@sfr.com",
    password:"test",
    role:"premium"
}
```

Les 3 utilisateurs ont des roles differents et ont donc des droits differents sur l'application.

- user1 : Aucun droit il auras donc aucune machine virtuelle de creer et ne pourras en creer aucune
- user2 : Peut creer une machine virtuelle uniquement (Debian)
- user3 : Peux creer jusqu'a 3 machines virtuelles (Ubuntu , Windows , Debian)

Vous avez juste besoin de cliquer sur le logo d'une distribution et la plateforme va lancer la creation de la Machine virtuelle.
Une fenetre de chargement apparaitra et une fois la machine virtuelle creer vos identifiants de connexion vous seront affichés en dessous du logo de la distribution choisie.

Si vous ne vous connecter pas dans les 10 min suivant la creation de la machine virtuelle celle ci sera supprimée automatiquement et les identifiant de connexion ne seront plus valides ni affiché.
