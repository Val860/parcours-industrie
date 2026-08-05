# Guide d'utilisation — Parcours Industrie

Tout ce qu'il faut savoir pour faire vivre le site **sans développeur**.
Aucun logiciel à installer, aucune ligne de commande, aucun compte technique.

---

## 1. Comment le site est organisé

Un **dossier par rubrique du menu**. Le nom du dossier devient l'adresse
sur le web.

```
parcours-industrie/
│
├── index.html                  ← page d'accueil        →  parcours-industrie.com
├── contact.html                                        →  /contact
├── a-propos.html                                       →  /a-propos
├── mentions-legales.html
├── politique-confidentialite.html
├── merci.html                  ← après envoi du formulaire
├── 404.html                    ← page « adresse introuvable »
│
├── vae/                        →  /vae/
│   ├── index.html              ← la page VAE elle-même
│   ├── cap-electricien.html    →  /vae/cap-electricien
│   ├── bac-pro-melec.html      →  /vae/bac-pro-melec
│   └── … 19 diplômes
│
├── bilan/index.html            →  /bilan/
├── reconversion/               →  /reconversion/   (+ 5 filières)
├── orientation/                →  /orientation/    (+ 5 pages)
├── coaching/                   →  /coaching/       (+ 5 pages)
├── entreprises/                →  /entreprises/    (+ 3 pages)
├── ingenierie/                 →  /ingenierie/     (+ 3 pages)
├── blog/
│   ├── index.html              →  /blog/
│   ├── vae-electricien.html    →  /blog/vae-electricien
│   └── article.html            ← page automatique pour les articles CMS
│
├── admin/                      ← interface CMS pour le client
│   ├── index.html              →  /admin/
│   └── config.yml              ← réglages Decap CMS
│
├── content/                    ← contenus modifiables depuis le CMS
│   ├── avis-clients.json
│   ├── site-images.json
│   └── blog/articles.json
│
├── assets/
│   ├── style.css   ← LE design de tout le site (couleurs, boutons, menu…)
│   └── main.js     ← LES animations de tout le site
│
├── images/         ← toutes les photos
│   └── uploads/    ← images envoyées depuis le CMS
├── logo.svg        ← le logo et ses déclinaisons
├── _redirects      ← les adresses « propres », sans le .html
├── sitemap.xml     ← la liste des pages pour Google
└── robots.txt
```

**Trois règles à retenir**

1. Une page = un fichier `.html`, rangé dans le dossier de sa rubrique.
2. Le fichier `index.html` d'un dossier est la page principale de la
   rubrique. C'est pour ça qu'il y en a un par dossier.
3. Le design n'est écrit **qu'une seule fois**, dans `assets/style.css`.

---

## 2. Mettre le site à jour (30 secondes)

1. Ouvrez [app.netlify.com](https://app.netlify.com) et connectez-vous
2. Cliquez sur le site **parcours-industrie**
3. Onglet **Deploys**
4. Glissez **le dossier complet** `parcours-industrie` dans la zone de dépôt
5. Attendez la barre verte « Published » — c'est en ligne

> **Glissez toujours le dossier entier, jamais un fichier seul.**
> Netlify remplace la totalité du site à chaque dépôt : envoyer un seul
> fichier effacerait tout le reste.

> Netlify conserve toutes les versions précédentes. Une bêtise ?
> **Deploys → cliquez sur une version antérieure → Publish deploy.**
> Le site revient à l'état d'avant en quelques secondes.

---

## 3. Modifier avis, articles et images avec le CMS

Une fois le site connecté à **GitHub + Netlify Identity + Git Gateway**,
le client peut aller sur :

```
https://votre-site.netlify.app/admin/
```

ou, après branchement du nom de domaine :

```
https://parcours-industrie.com/admin/
```

Le CMS permet de modifier sans coder :

- **Avis clients** : nom affiché, profil, service, texte, note, afficher/masquer
- **Informations de contact** : email, téléphone, adresse, zone d'intervention,
  délai de réponse et horaires de disponibilité
- **Articles de blog** : titre, résumé, image, catégorie, date, contenu
- **Images principales** : accueil, contact, merci, blog

### Modifier les informations de contact

`/admin/` → **Contenus du site** → **Informations de contact**

| Champ | Où il apparaît |
|---|---|
| Adresse email | page Contact, cliquable pour écrire |
| Téléphone | page Contact, **seulement si la case « Afficher » est cochée** |
| Adresse postale | idem, masquée par défaut |
| Mode de contact | badge du bandeau + bloc « Informations de contact » |
| Zone d'intervention | bloc « Informations de contact » |
| Délai de réponse | badge du bandeau + mention sous le formulaire |
| Disponibilités | tableau des horaires — une ligne par période |

Pour ajouter une période (jours fériés, fermeture d'été), cliquez sur
**Ajouter** sous la liste Disponibilités. Décochez « Ouvert » pour afficher
« Fermé » au lieu de « ✓ Disponible ».

> L'adresse email du cabinet est en **.fr** (`contact@parcours-industrie.fr`)
> alors que le site est en **.com**. C'est volontaire : la boîte mail et le
> site n'utilisent pas le même domaine.

Les images envoyées depuis le CMS sont rangées dans :

```
images/uploads/
```

Important :

1. Ne publiez que des avis avec autorisation du client.
2. Utilisez des images JPG, PNG ou WEBP optimisées.
3. Après publication dans le CMS, Netlify redéploie automatiquement le site.
4. Gardez les pages légales hors CMS : elles doivent rester stables.

---

## 4. Modifier un texte ou un tarif à la main

1. Clic droit sur le fichier `.html` → **Ouvrir avec → TextEdit** (Mac)
   ou **Bloc-notes** (Windows)
2. `Cmd+F` (ou `Ctrl+F`) → tapez le texte à changer
3. Modifiez **uniquement le texte**, jamais ce qui est entre `<` et `>`
4. Enregistrez, puis renvoyez le dossier sur Netlify (étape 2)

**Exemple** — passer un tarif de 900 à 950 € :

```html
<div class="service-price">À partir de 900 €</div>
                                        ↑
                       remplacez ce nombre, rien d'autre
```

> Sur Mac, TextEdit doit être en mode texte brut :
> **Format → Convertir au format texte** avant d'enregistrer.

---

## 5. Publier un nouvel article de blog à la main

### Étape 1 — demander l'article à Claude

Copiez-collez cette consigne en remplaçant le sujet :

> Génère un article de blog HTML complet pour le site Parcours Industrie
> sur le sujet : **« … »**.
> Utilise exactement la structure d'un article existant du dossier blog que je te
> fournis, sans modifier les zones marquées « NE PAS MODIFIER ».
> Respecte la palette navy #0d1b2a / orange #e8601c et les polices
> Barlow Condensed et Lato. Rédige le title, la meta description et le
> canonical. Ne mets aucun CSS de mise en page : tout est déjà dans
> assets/style.css.

Joignez un article existant du dossier `blog/`. Il contient déjà le menu,
le pied de page et les animations : Claude n'a qu'à adapter le contenu.

> Pensez à remplacer, dans votre article,
> `<meta name="robots" content="noindex, nofollow"/>`
> par `<meta name="robots" content="index, follow"/>`
> — sinon Google ne l'indexera pas.

### Étape 2 — enregistrer le fichier **dans le dossier `blog/`**

Nom en minuscules, sans accent ni espace, sans préfixe :

- ✅ `blog/vae-maintenance-industrielle.html` → en ligne sur `/blog/vae-maintenance-industrielle`
- ❌ `blog/Blog VAE Maintenance.html`

### Étape 3 — le référencer (3 ajouts)

**a) Dans `_redirects`**, dans la section « URLs propres » :

```
/blog/vae-maintenance-industrielle   /blog/vae-maintenance-industrielle.html   200
```

**b) Dans `sitemap.xml`**, avant la dernière ligne `</urlset>` :

```xml
  <url>
    <loc>https://parcours-industrie.com/blog/vae-maintenance-industrielle</loc>
    <lastmod>2026-07-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
```

**c) Dans `blog/index.html`**, ajoutez la carte de l'article dans la grille
(cherchez le commentaire `<!-- Grille articles -->`). Copiez une carte
existante et changez le lien, le titre et le texte.

### Étape 4 — déposer sur Netlify

Renvoyez le dossier complet. En ligne en 30 secondes.

---

## 6. Créer une page dans une rubrique existante

Même principe qu'un article, mais dans le dossier de la rubrique.
Exemple pour un nouveau diplôme VAE :

1. Dupliquez une fiche voisine, par exemple `vae/bac-pro-melec.html`
2. Renommez-la `vae/bts-mon-diplome.html`
3. Modifiez le texte, le `title`, la `meta description` et le `canonical`
4. Ajoutez sa ligne dans `_redirects` et son bloc dans `sitemap.xml`
5. Ajoutez le lien dans le menu (voir section 7)

**Attention aux chemins** : une page dans un sous-dossier désigne les
ressources de la racine avec `../` devant.

| Depuis | Pour la feuille de style | Pour une photo | Pour la page contact |
|---|---|---|---|
| `index.html` (racine) | `assets/style.css` | `images/photo.jpg` | `contact.html` |
| `vae/bac-pro-melec.html` | `../assets/style.css` | `../images/photo.jpg` | `../contact.html` |

En dupliquant une page **du même dossier**, les chemins sont déjà bons :
c'est la méthode la plus sûre.

---

## 7. Changer une photo

1. Générez votre photo (Gemini, Firefly, Leonardo, Ideogram…)
2. Compressez-la sur [tinypng.com](https://tinypng.com)
3. Renommez-la **exactement** comme celle qu'elle remplace, par exemple
   `electricien-tableau-electrique.jpg`
4. Déposez-la dans `images/` en écrasant l'ancienne

**Aucune page n'est à modifier** : les 57 pages pointent vers le nom de
fichier. Une photo remplacée = mise à jour partout d'un coup.
La liste complète est dans `images/README-IMAGES.md`.

---

## 8. Changer une couleur, un style, ou une entrée de menu

### Couleurs et styles

Ouvrez `assets/style.css`. Tout en haut :

```css
:root {
  --navy: #0d1b2a;     /* fond principal, navigation, pied de page */
  --orange: #e8601c;   /* boutons, accents, titres colorés */
  --cream: #f5f1eb;    /* fond des sections claires */
}
```

Changez la valeur, enregistrez : **les 57 pages changent d'un coup**.

### Entrée de menu

Le menu est répété dans chaque fichier `.html` — c'est la contrepartie du
« un fichier = une page », qui évite tout système de compilation.

Le plus simple : demandez à Claude

> Dans tous les fichiers HTML de ce site, dans le bloc `<nav class="pi-nav">`
> et dans le bloc `<div class="pi-mobile">`, ajoute une entrée de menu
> « … » pointant vers « … », en respectant la structure existante et en
> adaptant les chemins relatifs selon le dossier de chaque page.

---

## 9. Recevoir les demandes du formulaire

Les réponses arrivent dans **Netlify → Forms → contact**.

**À configurer une seule fois :**

1. Netlify → **Forms** → **Settings and usage**
2. **Form notifications** → **Add notification** → **Email notification**
3. Saisissez votre adresse email → **Save**

Vous recevrez ensuite chaque demande par mail, et l'historique complet
restera consultable dans Netlify.

> Le formulaire est protégé contre les robots spammeurs par un champ
> invisible (« honeypot »). Ne le supprimez pas du code.

---

## 10. Ce qu'il ne faut pas faire

| ❌ À éviter | Pourquoi |
|---|---|
| Déposer un fichier seul sur Netlify | Le reste du site est effacé — déposez le dossier entier |
| Déplacer une page d'un dossier à l'autre | Tous ses chemins `../` deviennent faux, et l'adresse change |
| Renommer une page déjà en ligne | Google a indexé l'ancienne adresse → 404 |
| Supprimer `assets/style.css` ou `assets/main.js` | Le site perd tout son design et ses animations |
| Modifier ce qui est entre `<` et `>` | Risque de casser la mise en page |
| Utiliser Word pour éditer un `.html` | Word ajoute du code invisible qui casse la page |
| Accents ou espaces dans un nom de fichier | Adresse cassée sur le web |
| Déposer une photo de 5 Mo | Le site devient lent, Google pénalise |

---

## 11. En cas de problème

| Symptôme | Cause la plus probable |
|---|---|
| La page s'affiche sans couleurs | Le dossier `assets/` n'a pas été envoyé, ou un `../` manque |
| Une photo n'apparaît pas | Nom différent (majuscule, accent, `.jpeg` au lieu de `.jpg`) ou `../` manquant |
| Le menu ne s'ouvre pas sur mobile | `assets/main.js` n'a pas été envoyé |
| Un lien renvoie une erreur 404 | Chemin relatif incorrect — comparez avec une page du même dossier |
| Le formulaire n'envoie rien | La notification email n'est pas configurée (§8) |
| Une modification n'apparaît pas | Cache du navigateur : `Cmd+Shift+R` / `Ctrl+F5` |

En dernier recours : **Netlify → Deploys → republier la version
précédente**. Le site revient à son état d'avant.
