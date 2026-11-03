# 我的校園生活就是這麼自強不息！～成為南山豹的我，這一年也太充實了吧～

新北市南山高級中學的 HD-2D 校園網頁遊戲（舊名「南山豹的一年」）。

玩家扮演 Q 版的南山豹，從 7–8 月入學一路玩到 6 月結業。每個月完成任務就能蓋章，最後拿到紀念卡。開場有三種身分可選：小六體驗（招生用）、國一新生、高一新生。

作者：國文科召集人闕宏宇老師。

## 怎麼玩
用瀏覽器直接開 `index.html` 就能玩，不需要安裝或建置。

## 檔案
| 路徑 | 說明 |
|---|---|
| `index.html` | 整個遊戲（單一檔案，純前端） |
| `tools/screenshot.py` | 截圖檢查工具（需要 Playwright） |
| `docs/handoff/` | 原始交接文件 |
| `AGENTS.md` | 給 AI 工具（Claude Code／Gemini Antigravity／ChatGPT）的共用開發規則 |
| `CLAUDE.md` | 只引用 `AGENTS.md` |

## 素材
目前沒有外部素材。角色、建物、特效都是程式繪製，全部在 `index.html` 裡。

日後如果加入影片、大量圖片或超過 50MB 的檔案，不要放進 repo。主檔請存放在 Google 雲端硬碟：`我的雲端硬碟/Chiue's Google/多元選修/115 AI導入數位教學示範學校/我的校園生活就是這麼自強不息/`，並在這一節註明位置。

## 部署
- 目前：claude.ai artifact（僅作者可見）。
- 預計：開發完成後建立 Google Apps Script 專案，用 clasp 管理。目前還沒有建立。

## 平常怎麼改（最簡單的做法）
1. 直接修改 Google 雲端硬碟資料夾 `我的校園生活就是這麼自強不息/` 裡的 `index.html`（主檔）。
2. 改完後，在那個資料夾執行：
   ```bash
   bash tools/sync-to-github.sh "這次改了什麼"
   ```
3. 大約 1 分鐘後，遊戲網址會更新：https://s90194yeu-collab.github.io/nanshan-panther-game/

不要直接改這個 repo 裡的 `index.html`，下次同步時會被雲端硬碟版本蓋掉。

## 開工／收工流程（進階：直接在 repo 用分支開發）
本專案會在不同電腦（Mac mini、MacBook Pro、iPhone 遠端）和不同 AI 工具（Claude Code、Gemini Antigravity、ChatGPT）之間**錯開**修改。每個工具使用自己的分支：

| 工具 | 分支 |
|---|---|
| Claude Code | `claude` |
| Gemini Antigravity | `gemini` |
| ChatGPT | `chatgpt` |

### 開工前
```bash
cd ~/Projects/nanshan-panther-game
git checkout claude          # 換成自己工具的分支
git pull
git merge origin/main        # 先拿到 main 的最新內容
```
如果已經建立 Apps Script 專案，並且要同步，請先執行 `clasp pull`，確認線上版沒有被別人改過。

### 收工時
```bash
python3 tools/screenshot.py  # 確認沒有 JS 錯誤、手機版正常
git add -A
git commit -m "說明這次改了什麼"
git push
```
確認沒問題後，再合併到 `main`：
```bash
git checkout main && git pull && git merge claude && git push
```
需要上線時，**經老師確認後**才執行 `clasp push`。

### 固定規則
- 禁止直接在 Apps Script 網頁編輯器改程式。如果已經改了，先 `clasp pull`，再 commit。
- 金鑰一律放 Apps Script「指令碼屬性」，不得寫進程式碼。
- 學生資料（名單、成績、作答紀錄）不得放進 repo。
- Git 工作資料夾只放在本機 `~/Projects/`，不要放在 Google 雲端硬碟同步區。
