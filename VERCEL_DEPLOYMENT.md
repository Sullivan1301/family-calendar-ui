# Guide de configuration Vercel pour Family Calendar

## 🚨 Problème détecté

L'erreur Vercel indique :
```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies".
```

**Cause :** Le projet est structuré en monorepo avec tout dans `apps/web/`, mais Vercel cherche le `package.json` à la racine.

---

## ✅ Solution 1 : Configurer via vercel.json (RECOMMANDÉ)

Le fichier `vercel.json` a été créé à la racine avec la configuration suivante :

```json
{
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/.next",
  "devCommand": "cd apps/web && npm run dev",
  "installCommand": "cd apps/web && npm install"
}
```

### Déploiement automatique

1. **Commit et push les changements :**
   ```bash
   git add vercel.json
   git commit -m "fix: add vercel.json for monorepo structure"
   git push
   ```

2. **Vercel détectera automatiquement la configuration**

---

## ✅ Solution 2 : Configurer via le dashboard Vercel

Si vous préférez configurer manuellement :

### Étapes :

1. **Aller sur** https://vercel.com/dashboard
2. **Sélectionner votre projet** : `family-calendar-ui`
3. **Aller dans Settings** → **General**
4. **Modifier "Root Directory"** :
   - Cliquer sur "Edit"
   - Sélectionner "apps/web"
   - Sauvegarder

5. **Modifier "Build & Development Settings"** :
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`
   - **Install Command** : `npm install`
   - **Development Command** : `npm run dev`

---

## ✅ Solution 3 : Déplacer le package.json à la racine

**NON RECOMMANDÉ** car cela casserait la structure monorepo.

---

## 🔍 Vérification après configuration

Après avoir appliqué l'une des solutions, le build devrait fonctionner :

```
✅ Detecting Next.js version...
✅ Found Next.js version: 16.1.5
✅ Installing dependencies...
✅ Running build...
✅ Build completed successfully!
```

---

## 📂 Structure du projet

```
family-calendar-ui/
├── vercel.json              ← Configuration Vercel (NOUVEAU)
├── apps/
│   └── web/
│       ├── package.json     ← VRAI package.json avec Next.js
│       ├── src/
│       ├── public/
│       └── .next/           ← Output du build
├── supabase/
└── docs/
```

---

## ⚠️ Points importants

### Variables d'environnement

N'oubliez pas de configurer les variables d'environnement dans Vercel :

1. **Aller dans Settings** → **Environment Variables**
2. **Ajouter** :
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_value
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
   SUPABASE_SERVICE_ROLE_KEY=your_value
   DATABASE_URL=your_value
   BETTER_AUTH_SECRET=your_value
   BETTER_AUTH_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

### Branches de déploiement

- **Production** : Branche `main`
- **Preview** : Branches de feature (ex: `api`)
- **Development** : Branche `dev` (si existe)

---

## 🐛 Troubleshooting

### Erreur : "Module not found: postgres"

**Solution :** S'assurer que `pg` est dans les dépendances :
```bash
cd apps/web
npm install pg
```

### Erreur : "BETTER_AUTH_SECRET is not defined"

**Solution :** Générer un secret et l'ajouter à Vercel :
```bash
openssl rand -base64 32
```

### Le build réuss mais l'app ne démarre pas

**Vérifier :**
1. Les variables d'environnement sont configurées
2. Supabase est accessible
3. La base de données a les bonnes tables (migrations exécutées)

---

## 🚀 Déploiement réussi

Une fois configuré, chaque push déclenchera automatiquement :

1. **Installation des dépendances** dans `apps/web/`
2. **Build Next.js** avec optimisation
3. **Déploiement** sur Vercel Edge Network
4. **URL de preview** pour les branches de feature

---

## 📞 Support

Si le problème persiste :

1. **Vérifier** : `cat vercel.json`
2. **Tester en local** : `cd apps/web && npm run build`
3. **Logs Vercel** : Dashboard → Deployments → Voir les logs

---

**Prochaine étape :** Commit et push pour déclencher un nouveau build ! 🚀
