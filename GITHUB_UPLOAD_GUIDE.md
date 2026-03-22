# 📤 How to Upload DerivX to GitHub — Complete Code Guide

## Choose Your Method

| Method | Best For | Difficulty |
|--------|----------|------------|
| **A — Automated Script** | Quickest, one command | ⭐ Easiest |
| **B — Manual Git Commands** | Full control | ⭐⭐ Easy |
| **C — GitHub CLI (gh)** | Power users | ⭐⭐ Easy |

---

## ✅ Prerequisites — Install These First

### 1. Install Git
- **Windows:** https://git-scm.com/download/win → Download → Install (all defaults)
- **Mac:** Open Terminal → type `git --version` → if prompted, click Install
- **Linux:** `sudo apt install git` or `sudo dnf install git`

Verify: Open Terminal / Command Prompt and run:
```bash
git --version
# Should show: git version 2.x.x
```

### 2. Install Node.js (needed to build the project)
- Download from: https://nodejs.org → **LTS version**
- Verify: `node --version` → should show `v18.x.x` or higher

### 3. Create a GitHub account
- Go to **github.com** → Sign up (free)

---

## METHOD A — Run the Deploy Script (Easiest)

### On Mac / Linux:
```bash
# 1. Open Terminal and go into your project folder
cd path/to/derivx-next

# 2. Make script executable
chmod +x deploy.sh

# 3. Run it
./deploy.sh
```

### On Windows:
```batch
:: Open Command Prompt, go to your project folder
cd path\to\derivx-next

:: Double-click deploy.bat  OR  run:
deploy.bat
```

The script will ask for your username, create the commit, and give you the exact commands.

---

## METHOD B — Manual Git Commands (Step by Step)

### Step 1 — Open Terminal in your project folder

**Mac/Linux:**
```bash
cd ~/Downloads/derivx-next
# OR drag the folder onto Terminal
```

**Windows:**
```batch
:: Open Command Prompt (Win+R → cmd → Enter)
cd C:\Users\YourName\Downloads\derivx-next
```

**VS Code shortcut:**
- Open VS Code → File → Open Folder → select `derivx-next`
- Press **Ctrl+` ** (backtick) to open the built-in terminal

---

### Step 2 — Configure Git identity (one-time setup)

```bash
git config --global user.name "YourGitHubUsername"
git config --global user.email "your@email.com"
```

---

### Step 3 — Initialize Git repository

```bash
git init
```

Output: `Initialized empty Git repository in .../derivx-next/.git/`

---

### Step 4 — Create GitHub repository

**Option A — In browser:**
1. Go to **github.com/new**
2. Repository name: `derivx`
3. Visibility: **Public**
4. ⚠️ **Do NOT** check "Add README", "Add .gitignore", or "Choose license"
5. Click **"Create repository"**
6. Copy the URL shown: `https://github.com/YOURNAME/derivx.git`

**Option B — GitHub CLI (if installed):**
```bash
gh repo create derivx --public
```

---

### Step 5 — Add all files to Git

```bash
# Check what files will be added (optional)
git status

# Add everything
git add .

# Verify what's staged
git status
# Should show green files — NOT node_modules (it's in .gitignore)
```

---

### Step 6 — Create your first commit

```bash
git commit -m "Initial DerivX commit — Options & Derivatives Platform"
```

Output:
```
[main (root-commit) abc1234] Initial DerivX commit
 31 files changed, 2847 insertions(+)
 create mode 100644 app/globals.css
 create mode 100644 app/layout.jsx
 ...
```

---

### Step 7 — Set branch name to main

```bash
git branch -M main
```

---

### Step 8 — Connect to GitHub

Replace `YOURNAME` and `derivx` with your actual username and repo name:

```bash
git remote add origin https://github.com/YOURNAME/derivx.git
```

Verify it's set:
```bash
git remote -v
# origin  https://github.com/YOURNAME/derivx.git (fetch)
# origin  https://github.com/YOURNAME/derivx.git (push)
```

---

### Step 9 — Push to GitHub

```bash
git push -u origin main
```

**First time:** GitHub will ask for your credentials:
- Username: your GitHub username
- Password: **NOT your GitHub password** → use a **Personal Access Token**

#### Create a Personal Access Token (required):
1. GitHub → Click your avatar (top right) → **Settings**
2. Scroll to bottom → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. Note: `DerivX deploy`
6. Expiration: 90 days
7. Check: ✅ **repo** (full control)
8. Click **Generate token**
9. **Copy the token** (starts with `ghp_...`) — you won't see it again!
10. Use this token as your "password" when Git asks

**On Windows — save credentials so you don't type it every time:**
```batch
git config --global credential.helper manager
```

**On Mac — save in Keychain:**
```bash
git config --global credential.helper osxkeychain
```

After successful push, output:
```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
Writing objects: 100% (45/45), 82.00 KiB | 1.50 MiB/s, done.
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **Your code is now on GitHub!**

Visit: `https://github.com/YOURNAME/derivx`

---

## METHOD C — GitHub CLI (Cleanest, All-in-One)

```bash
# 1. Install GitHub CLI
# Mac:
brew install gh

# Windows (with winget):
winget install --id GitHub.cli

# Linux:
sudo apt install gh   # or: sudo dnf install gh

# 2. Login to GitHub
gh auth login
# Choose: GitHub.com → HTTPS → Login with browser → follow prompts

# 3. Go into your project folder
cd path/to/derivx-next

# 4. One command — init, create repo, and push:
git init
git add .
git commit -m "Initial DerivX commit"
gh repo create derivx --public --source=. --remote=origin --push

# Done! Output:
# ✓ Created repository YOURNAME/derivx on GitHub
# ✓ Pushed commits to https://github.com/YOURNAME/derivx.git
```

---

## 🌐 Deploy to Netlify After Pushing

### Option A — Netlify Website (Point and Click)

1. Go to **app.netlify.com** → log in with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"** → authorize
4. Select your `derivx` repository
5. Settings auto-fill from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click **"Deploy site"**
7. Wait ~2-3 minutes → live at `https://derivx-xyz.netlify.app`
8. Rename: Site settings → Change site name → `derivx-hull`

### Option B — Netlify CLI (All Terminal)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login
# Opens browser → click "Authorize"

# From inside your derivx-next folder:
netlify init
# Choose: Create & configure a new site
# Team: your team
# Site name: derivx-hull (or leave blank for random)

# Deploy to production
netlify deploy --prod

# Done! Your site URL is shown in the output
```

---

## 🔄 Making Updates Later

After the initial setup, updating is just 3 commands:

```bash
# 1. Save your changes in VS Code / editor

# 2. Stage changed files
git add .

# 3. Commit with a message describing what changed
git commit -m "Add Chapter 3 — Hedging with Futures"

# 4. Push to GitHub
git push

# Netlify auto-redeploys in ~2 minutes! ✅
```

---

## 🆘 Common Errors & Fixes

### `git: command not found`
```bash
# Mac: Install Xcode command line tools
xcode-select --install

# Windows: Download from git-scm.com and reinstall
```

### `remote: Repository not found`
```bash
# Wrong URL — check it:
git remote -v

# Fix it:
git remote set-url origin https://github.com/CORRECT_USERNAME/CORRECT_REPO.git
```

### `error: failed to push — updates were rejected`
```bash
# Your local is behind remote — force push (safe for first push)
git push -u origin main --force
```

### `Authentication failed` when pushing
```bash
# Use a Personal Access Token as password (see Step 9 above)
# OR use GitHub CLI:
gh auth login
```

### `npm run build` fails on Netlify
```bash
# Test the build locally first:
npm install
npm run build
# Fix any errors shown, then push again
```

### Files missing after push (node_modules uploading)
```bash
# Check .gitignore exists and has node_modules/
cat .gitignore

# If missing, create it:
echo "node_modules/" > .gitignore
echo ".next/" >> .gitignore
git add .gitignore
git commit -m "Add gitignore"
git push
```

---

## 📋 Summary — Shortest Path

```bash
# ── FIRST TIME ──────────────────────────────
cd derivx-next                                          # go into folder
git init                                                # initialize
git config --global user.name "YourName"               # set identity
git config --global user.email "you@email.com"         # set email
git add .                                               # stage files
git commit -m "Initial commit"                          # commit
git branch -M main                                      # set branch
git remote add origin https://github.com/YOU/REPO.git  # link to GitHub
git push -u origin main                                 # PUSH!

# ── EVERY UPDATE AFTER ──────────────────────
git add .
git commit -m "Describe your change"
git push
```

That's it! 🎉
