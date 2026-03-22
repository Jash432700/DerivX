#!/bin/bash
# ═══════════════════════════════════════════════════════
#  DerivX — Full GitHub + Netlify Deploy Script
#  Run this ONCE from inside your derivx-next/ folder
# ═══════════════════════════════════════════════════════

set -e  # Exit on any error

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   DerivX — GitHub Deploy Script      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── STEP 1: Check Git is installed ──
if ! command -v git &> /dev/null; then
  echo "❌ Git not found. Install from https://git-scm.com"
  exit 1
fi
echo "✅ Git found: $(git --version)"

# ── STEP 2: Ask for GitHub username + repo name ──
echo ""
read -p "👤 Enter your GitHub username: " GH_USER
read -p "📦 Enter repo name (e.g. derivx): " REPO_NAME
read -p "📧 Enter your email (for git config): " GIT_EMAIL

echo ""
echo "📋 Summary:"
echo "   GitHub User : $GH_USER"
echo "   Repo Name   : $REPO_NAME"
echo "   Email       : $GIT_EMAIL"
echo ""
read -p "✅ Looks good? Press Enter to continue (Ctrl+C to cancel)..."

# ── STEP 3: Configure git identity ──
git config --global user.name "$GH_USER"
git config --global user.email "$GIT_EMAIL"
echo "✅ Git identity configured"

# ── STEP 4: Initialize repo ──
if [ ! -d ".git" ]; then
  git init
  echo "✅ Git repo initialized"
else
  echo "ℹ️  Git repo already exists"
fi

# ── STEP 5: Create .gitignore if missing ──
if [ ! -f ".gitignore" ]; then
cat > .gitignore << 'EOF'
node_modules/
.next/
.env
.env.local
.env.production.local
.DS_Store
*.log
EOF
  echo "✅ .gitignore created"
fi

# ── STEP 6: Stage all files ──
git add .
echo "✅ All files staged"

# ── STEP 7: Initial commit ──
git commit -m "🚀 Initial DerivX commit — Options, Futures & Derivatives Platform"
echo "✅ Initial commit created"

# ── STEP 8: Set branch to main ──
git branch -M main
echo "✅ Branch set to main"

# ── STEP 9: Instructions to create GitHub repo ──
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 NEXT: Create repo on GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option A — GitHub CLI (gh):"
echo "   gh repo create $REPO_NAME --public --source=. --remote=origin --push"
echo ""
echo "Option B — Manual (if you don't have gh):"
echo "   1. Go to: https://github.com/new"
echo "   2. Repository name: $REPO_NAME"
echo "   3. Set to Public, DO NOT add README"
echo "   4. Click 'Create repository'"
echo "   5. Then run the commands below:"
echo ""
echo "   git remote add origin https://github.com/$GH_USER/$REPO_NAME.git"
echo "   git push -u origin main"
echo ""

# ── STEP 10: Try GitHub CLI if available ──
if command -v gh &> /dev/null; then
  echo "✅ GitHub CLI (gh) detected!"
  read -p "🚀 Auto-create and push to GitHub now? (y/n): " DO_PUSH
  if [ "$DO_PUSH" = "y" ]; then
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
    echo ""
    echo "✅ Pushed to: https://github.com/$GH_USER/$REPO_NAME"
  fi
else
  echo "ℹ️  GitHub CLI not found — use Option B above"
  echo "   Install gh: https://cli.github.com"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 After pushing, deploy to Netlify:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   1. Go to https://app.netlify.com"
echo "   2. 'Add new site' → 'Import from Git'"
echo "   3. Select: github.com/$GH_USER/$REPO_NAME"
echo "   4. Build command:  npm run build"
echo "   5. Publish dir:    .next"
echo "   6. Click Deploy!"
echo ""
echo "   OR use Netlify CLI:"
echo "   npm install -g netlify-cli"
echo "   netlify login"
echo "   netlify init"
echo "   netlify deploy --prod"
echo ""
echo "╔══════════════════════════════════════╗"
echo "║  🎉 Setup complete!                  ║"
echo "╚══════════════════════════════════════╝"
