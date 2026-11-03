# AGENTS.md — 《我的校園生活就是這麼自強不息！～成為南山豹的我，這一年也太充實了吧～》

> 這是 Claude Code、Gemini Antigravity、ChatGPT 共用的規則主檔。`CLAUDE.md` 只會引用這份檔案。
> 所有介面文字、說明與回覆一律用**繁體中文**。
> 原始交接文件保留在 `docs/handoff/CLAUDE-原始交接.md`，請勿改寫。

## 1. 專案簡介與設計方向
- 新北市南山高級中學的校園網頁遊戲，靈感來自《臺北狂飆》。舊名「南山豹的一年」。
- 書名採輕小說風格，標題與文案一律用正面敘述。
- 主角是 Q 版、兩腳站立的「南山豹」，從 7–8 月入學一路玩到 6 月結業，共 11 個月。
- 每個月有幾個任務：問答、小遊戲、收集、逛攤位。
  - 完成當月所有**必做**任務後蓋一個章，並自動進入下個月。
  - 畫面上用泡泡框顯示其他年級在做什麼。
- 作者：國文科召集人闕宏宇老師。

### 目標玩家（設計時永遠先想這三種人）
1. **想讀南山的小六生（招生用）**
   - 開場選「🔍 小六體驗」，走國中部（國一）路線，`G='j'`、`VISIT=true`。
   - 結尾拿到「我的南山體驗卡」。
2. **國一新生**：熟悉校園、處室、行事曆與國中部課程。
3. **高一新生**：熟悉高中部課程（多元選修、自主學習、學習歷程）與校園。

文字要讓小六生看得懂。新增專有名詞（段考、學校日、直升／外考、學測、學習歷程……）時，要一併補進 `GLOSS`（📖 南山小辭典）。

## 2. 檔案架構

| 路徑 | 分工 |
|---|---|
| `index.html` | **整個遊戲**。單一檔案、純前端、不需建置，約 1650 行。不載入任何外部 CSS、JS 或字型。 |
| `tools/screenshot.py` | Playwright 截圖檢查：三種身分各跑一次桌機版，再跑一次手機橫向；輸出到 `shots/`（已列入 .gitignore）。 |
| `tools/sync-to-github.sh` | 從雲端硬碟資料夾同步到 GitHub（見第 8 節）。 |
| `docs/handoff/CLAUDE-原始交接.md` | 原始交接文件，內容不改寫。 |
| `AGENTS.md` | 本檔，共用規則。 |
| `CLAUDE.md` | 只有一行 `@AGENTS.md`。 |
| `README.md` | 專案說明與開工／收工流程。 |

### `index.html` 內 `<script>` 區塊（搜尋註解標題即可找到，行號為大約位置）
| 約略行號 | 區塊 | 內容 |
|---|---|---|
| 142 | `HD-2D 引擎` | 投影 `PX`／`PY`、放大倍率 `K=1.8`、建物高度比例 `HS=.46`、俯視壓縮 `TILT=.74`；`HOOK` 擴充點 |
| 163 | `角色：SVG 向量路徑` | `charShapes`、`makeChar`、`drawChar`、`portrait`、`tagCanvas`、`bubbleCanvas` |
| 333–526 | `校園`、`建物資料`、`地面`、`樹` | `building()` 使用**未放大**座標，函式內自動乘 K；碰撞 `addBox`／`hitBox`；`KEEP` 是不種樹的位置 |
| 556 | `一學年` | `MONTHS`（11 個月）、`TASKS` |
| 790–800 | 新增任務、各科小教室題庫 | 社團博覽會、大隊接力；`QBANK`、`QLOC` |
| 851–943 | 辦學成果、其他年級、董事長／校長／主任、校歌 | `HONORS`、`NPCS`、`OFFNPC`、`LEADERS`／`OFFICES`／`CHIEF_NPC`、`openOffice`、`chiefCard`、`SONG`、`showAnthem` |
| 958–1137 | 收集物、介面、小遊戲、樓層導覽 | `coins`、`flags`、`dialog({...})`、`enterMonth`、`complete`、`trigger`、`MG.*`、`BINFO` |
| 1165–1357 | 輸入、角色、小地圖、地面材質、動態物件、後製、主迴圈 | 移動、繪製、排序與遮擋淡化 |
| 1436 起 | `擴充功能` | 存檔、時段天氣、社團博覽會、各科小教室、大隊接力、找地點、小辭典、集章冊與紀念卡、選單 |

### `HOOK` 擴充點
新功能盡量掛在 `HOOK` 上，**不要改主迴圈**。

| 擴充點 | 用途 |
|---|---|
| `HOOK.update(dt)` | 每幀更新 |
| `HOOK.ground` | 畫地面層 |
| `HOOK.actors` | 加入要排序的物件，用 `add(x,z,draw)` |
| `HOOK.overlay` | 世界座標的最上層 |
| `HOOK.screen` | 螢幕座標後製 |
| `HOOK.map` | 小地圖 |

## 3. 技術環境
- **現況**：純 HTML／CSS／JavaScript，使用 2D Canvas，用瀏覽器直接開 `index.html` 就能玩。
  - 進度只存在瀏覽器本機（`localStorage`）。
  - 目前發布在 claude.ai artifact；`showCard()` 會偵測 `window.claude.use('downloads')`，在其他環境改用一般下載連結。
- **Apps Script（尚未建立）**：預計開發完成後再建立 Apps Script 專案，目前**沒有** `.clasp.json`、`appsscript.json`、`Code.gs`。建立時要注意下列幾點：
  - 需要新增 `Code.gs`，在 `doGet()` 裡用 `HtmlService.createHtmlOutputFromFile('index')` 送出頁面。
  - HtmlService 不採用 HTML 裡的 `<meta name="viewport">`，要在 `doGet()` 用 `.addMetaTag('viewport', ...)` 補上，否則手機版會跑掉。
  - 要嵌入 Google Sites，需要 `.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)`。
  - 頁面跑在沙箱 iframe（googleusercontent.com）裡，`localStorage` 存檔與紀念卡下載都要實測。
  - clasp 已裝在 `~/.npm-global/bin/clasp`。登入名稱是 `zongheng`（帳號 s90194yeu@gm.nssh.ntpc.edu.tw），所以指令要加 `--user zongheng`。
- **其他可行部署**：GitHub Pages 或嵌入 Google Sites。

## 4. 已確定的設計決定（請勿任意更動）
1. **畫面風格：非像素的 HD-2D。**
   - 2D Canvas 斜俯視，建物有立體牆面與屋頂。
   - 景深、柔光、光束、光點、暗角、時段色調、雨天都要保留。
   - **不用 Three.js、不做 3D、不要像素風。** 角色用 SVG 路徑平滑描繪（`charShapes`）。
2. **校園配置**：依「115 地震避難掩護疏散路線圖」配置，座標全部乘 `K=1.8`。
   - 照片中有「？」的高塔是大中至正樓，右側是行健樓。
3. **年級位置**
   - 國一：熊祥。
   - 國二：自強、崇智。
   - 國三：直升班在崇智，外考班在曹俊。
   - 高一、高二：大中至正。
   - 高三：曹俊。
   - 樓層導覽裡的班級只標年級。
4. **人物與稱呼**
   - 董事長、校長、7 位處室主任寫全名，站在校園裡。
   - **組長一律不寫姓名，連姓也不寫**，只顯示「生輔組　組長」「信息組　副組長」。
     - `OFFICES[].chiefs` 只存單位字串，`CHIEF_NPC` 只存 `{unit, help}`。
     - **不可再加回任何組長姓名。**
   - 組長只出現在辦公室對話框：靠近主任按 E（手機點 💬）進辦公室才看得到。
5. **制服**：依服儀準則「男生繡藍字、女生繡紅字」，男生滾邊藍 `#2f5fb5`、女生紅 `#d8343f`（`UNI` 常數）。實際配色仍待確認。
6. **課程分流**：國一和高一課程完全不同，用 `J(國一值, 高一值)` 與 `only:'j'|'s'` 區分。
7. **校歌**：升旗台旁有校歌碑，選單裡也能開；7–8 月另有「新生訓練：學唱校歌」任務。
   - 歌詞和錄音由學校提供，填進 `SONG`。**不要自行補寫，也不要從網路抓歌詞。**
8. **暫不做**：班級帳號登入與雲端進度紀錄。

## 5. 常見修改
- **各科老師出題**
  - 在 `QBANK.j`（國中部，也給小六體驗用）或 `QBANK.s`（高中部）加一筆：
    `{id:'唯一代號', s:'科目', q:'題目', o:['正解','誘答','誘答','誘答'], a:0, ex:'解說'}`
  - 選項顯示時會自動洗牌，正解放第一個（`a:0`）即可。
  - 國中題難度以國小畢業到國一上為準，小六生也要能作答。
- **新增必做任務**
  - 在 `TASKS` 加：`{m:月份, id, name, x, z, type:'quiz'|'mg'|'talk'|'collect'|'visit'|'final', title, ...}`，座標用**未放大值**。
  - 加分任務另外加 `opt:true`。
- **新增月份泡泡**：在 `MONTHS[i].others` 加 `{who, at:'A'~'F', text}`。
- **新增可搜尋地點**
  - 在 `FIND` 的建立函式裡呼叫 `push(名稱, 位置說明, x, z)`。
  - `BINFO` 的樓層文字（以「・」分隔）會自動加入搜尋。

## 6. 已知陷阱
- 座標有兩套：資料（`building()`、`TASKS`、`KEEP`）用**未放大值**，執行時才乘 `K`。不要重複乘。
- 新座標要確認不在建物碰撞框裡：`blocked(x*K,z*K)` 要回傳 `false`。
- 同月任務之間至少相距 4（未放大值）。新任務點也要加進 `KEEP`，避免樹長在上面。
- 手機橫向（844×390）的按鈕容易互相蓋住，新增按鈕後一定要截圖確認。
- 官網、Matterport、學生手冊網址都擋爬蟲。資料以老師提供的檔案為準，不要自行上網補資料。

## 7. 不可做的事
- 不可在 Google 雲端硬碟同步區裡建立或操作 git repo。Git repo 固定在本機 `~/Projects/nanshan-panther-game`；平常修改雲端硬碟資料夾，再用 `tools/sync-to-github.sh` 同步。
- 不可把金鑰、token、密碼寫進程式碼或 commit；金鑰一律放 Apps Script「指令碼屬性」。
- 不可把學生資料（姓名、班級座號、成績、作答紀錄）放進 repo。
- 不可加回組長姓名，也不可自行補寫校歌歌詞。
- 不可改成 3D、Three.js 或像素風；不可為了新功能改寫主迴圈。
- 不可直接在 Apps Script 網頁編輯器改程式（見第 8 節）。
- 未經老師確認，不可執行 `clasp push`、`clasp push --force`、`clasp deploy`。

## 8. 多工具輪流修改的固定流程
這個專案會在 Mac mini（主機）、MacBook Pro、iPhone 遠端之間，以及 Claude Code、Gemini Antigravity、ChatGPT 之間**錯開**修改，不會同時改。

### 主要做法（2026-11-03 起，老師指定）：在雲端硬碟資料夾修改，再用腳本同步
- **主檔位置**：Google 雲端硬碟的 `我的雲端硬碟/Chiue's Google/多元選修/115 AI導入數位教學示範學校/我的校園生活就是這麼自強不息/`。直接改這裡的 `index.html`。
- **同步**：改完並驗證後，在該資料夾執行 `bash tools/sync-to-github.sh "這次改了什麼"`。
  - 腳本會把檔案複製到 `~/Projects/nanshan-panther-game`，commit 到 `claude` 分支，再合併到 `main` 並推送。GitHub Pages 約 1 分鐘後更新。
  - GitHub 上的 `index.html` 在上次同步後被別處改過時，腳本會停下來；變更中疑似有金鑰時也會停下來，不會 commit。
- **不要直接改這個 repo 裡的 `index.html`**，下次同步會被雲端硬碟版本蓋掉。如果真的在 repo 改了，請先把檔案複製回雲端硬碟資料夾。
- 雲端硬碟資料夾裡不可以執行 `git init`。

### 進階做法：直接在 repo 用分支開發
**開工前**
1. `git checkout <自己的分支>`。Claude Code 用 `claude`，Gemini Antigravity 用 `gemini`，ChatGPT 用 `chatgpt`。
2. `git pull`，並把 `main` 的最新內容合併進來：`git merge origin/main`。
3. 如果已經建立 Apps Script 專案、而且要同步：先執行 `clasp pull`，確認線上版沒有被別人改過。

**收工時**
1. 依第 9 節驗證。
2. `git add`、`git commit`、`git push`，推到自己的分支。
3. 確認沒問題之後，再合併到 `main` 並推送。
4. 需要上線時，**經老師確認後**才執行 `clasp push`。

**其他規則**
- 禁止直接在 Apps Script 網頁編輯器改程式。如果已經改了，先 `clasp pull`，再 commit。
- 金鑰一律放 Apps Script「指令碼屬性」（`PropertiesService.getScriptProperties()`），不得寫進程式碼。

## 9. 驗證方式
- 執行 `python3 tools/screenshot.py`（需要 Playwright）。
  - 三種身分各跑一次桌機版，再跑一次手機橫向（844×390）。
  - 每次截遊戲畫面、選單、處室名冊、找地點四張到 `shots/`，並印出 JS 錯誤。
- 每次改完至少確認：
  - [ ] 沒有 JS 錯誤。
  - [ ] 對話框正常。
  - [ ] 手機橫向的按鈕沒有互相蓋住。
  - [ ] 新任務點或攤位沒有卡在建物裡。
  - [ ] `git status` 裡沒有金鑰或學生資料。

## 10. 資料來源
- 115 地震避難疏散路線圖。
- 國中、高中學生手冊。
- 11501、11402 行事曆。
- 115-1 學務與教務會議資料。
- 80 週年校慶專刊目錄（特色社團名稱）。
- 校務資料與新聞報導（榮譽榜）。

## 11. 待辦／待確認
- [ ] 校歌歌詞與錄音（填入 `SONG`）。
- [ ] 實際制服配色。
- [ ] 建物外牆顏色（目前多為推測）。
- [ ] 社團攤位介紹由社團活動組確認，也可以換成國中部、高中部各自的社團。
- [ ] 各科小教室題目請各科老師審核或增補。
- [ ] 小六體驗結尾加上招生資訊或報名連結（由學校提供）。
- [ ] 橫幅榮譽加進 `HONORS`：卓越學校、校務評鑑一等特優、AI 數位教學示範學校、藝術教育績優、閱讀磐石、戶外教育績優、國際健康安全學校、品德教育特優、三好校園。
- [ ] 開發完成後建立 Apps Script 專案（`Code.gs`、`appsscript.json`、`.clasp.json`），並把本檔第 3 節更新為實際狀況。
