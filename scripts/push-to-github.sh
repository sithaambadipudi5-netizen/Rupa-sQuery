#!/usr/bin/env bash
# Push RUPA's Query to GitHub repository
set -e

echo "=========================================================="
echo "  RUPA's Query — Push to GitHub Repository"
echo "=========================================================="

if [ -z "$1" ]; then
  echo ""
  echo "Usage: ./scripts/push-to-github.sh <YOUR_GITHUB_REPO_URL>"
  echo "Example:"
  echo "  ./scripts/push-to-github.sh https://github.com/rupavani-ambadipudi/rupas-query.git"
  echo ""
  exit 1
fi

REPO_URL="$1"

# Check if origin already exists
if git remote | grep -q 'origin'; then
  echo "Updating existing 'origin' remote to: $REPO_URL"
  git remote set-url origin "$REPO_URL"
else
  echo "Adding 'origin' remote: $REPO_URL"
  git remote add origin "$REPO_URL"
fi

echo "Ensuring primary branch is 'main'..."
git branch -M main

echo "Pushing code and architecture documentation to GitHub..."
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "Visit your repository at: $REPO_URL"
