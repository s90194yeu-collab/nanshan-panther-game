#!/bin/bash
# 把 Google 雲端硬碟資料夾（實際編輯的地方）同步到 GitHub。
# 用法：bash tools/sync-to-github.sh "這次改了什麼"
#   - 雲端硬碟資料夾 = 這個腳本所在的 tools/ 的上一層
#   - Git repo 固定在 ~/Projects/nanshan-panther-game（.git 不放雲端硬碟）
#   - 流程：claude 分支 commit → push → 合併到 main → push（GitHub Pages 約 1 分鐘後更新）
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$HOME/Projects/nanshan-panther-game"
MSG="${1:-更新：從雲端硬碟同步}"
MARK="$REPO/.git/last-drive-sync"   # 上次同步時 index.html 的雜湊，用來偵測 GitHub 上被別人改過

[ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)"
[ "$SRC" = "$REPO" ] && { echo "請從雲端硬碟資料夾執行這個腳本，不是從 repo 裡執行。"; exit 1; }
[ -f "$SRC/index.html" ] || { echo "找不到 $SRC/index.html"; exit 1; }

cd "$REPO"
[ -z "$(git status --porcelain)" ] || { echo "repo 有未 commit 的變更，先處理：$REPO"; git status --short; exit 1; }
git checkout -q claude
git pull -q --ff-only
git merge -q --ff-only origin/main || { echo "claude 分支無法快轉到 main，請手動處理。"; exit 1; }

# 安全檢查：GitHub 上的 index.html 在上次同步後被別的工具改過，而雲端硬碟也不一樣 → 停下來，避免蓋掉
cur=$(git hash-object index.html)
if [ -f "$MARK" ] && [ "$(cat "$MARK")" != "$cur" ] && ! cmp -s "$SRC/index.html" index.html; then
  echo "⚠️ GitHub 上的 index.html 在上次同步後被改過（可能是 Gemini／ChatGPT），雲端硬碟版本也不同。"
  echo "   為避免互相覆蓋，已停止。請先決定以哪一份為準。"
  exit 1
fi

# 複製：遊戲本體、工具、素材（assets/）、原始交接說明（不刪除 repo 內其他檔案）
cp "$SRC/index.html" index.html
[ -f "$SRC/showcase.html" ] && cp "$SRC/showcase.html" showcase.html  # 自動展示頁
rsync -a --exclude 'shots/' --exclude '.DS_Store' "$SRC/tools/" tools/
[ -d "$SRC/assets" ] && rsync -a --exclude '.DS_Store' "$SRC/assets/" assets/  # 學校提供的圖片、照片
[ -f "$SRC/CLAUDE.md" ] && cp "$SRC/CLAUDE.md" "docs/handoff/CLAUDE-原始交接.md"
[ -f "$SRC/GEMINI.md" ] && cp "$SRC/GEMINI.md" "docs/handoff/GEMINI-交接給Antigravity.md"
[ -f "$SRC/AGENTS.md" ] && cp "$SRC/AGENTS.md" "docs/handoff/AGENTS.md"

git add -A
if git diff --cached --quiet; then
  echo "沒有變更，不需要同步。"; git hash-object index.html > "$MARK"; exit 0
fi

# 機密掃描：金鑰、token 一律不准進 repo
if git diff --cached -U0 | grep -nEi 'AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9_-]{20,}|sk-ant-|ghp_[A-Za-z0-9]{20,}|xox[bp]-|BEGIN .*PRIVATE KEY|refresh_token|client_secret' >/dev/null; then
  git reset -q
  echo "⚠️ 變更中疑似有金鑰或 token，已停止，沒有 commit。金鑰請放 Apps Script「指令碼屬性」。"
  exit 1
fi

git diff --cached --stat
git commit -q -m "$MSG"
git push -q
git checkout -q main
git pull -q --ff-only
git merge -q --ff-only claude
git push -q
git checkout -q claude
git hash-object index.html > "$MARK"
echo "✅ 已同步到 GitHub（claude 與 main）：$(git log --oneline -1)"
echo "   遊戲網址約 1 分鐘後更新：https://s90194yeu-collab.github.io/nanshan-panther-game/"
