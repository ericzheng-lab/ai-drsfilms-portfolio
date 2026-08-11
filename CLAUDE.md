# ai-drsfilms-portfolio(ai.drsfilms.com)— Claude Code 项目规则

> 优先级:本文件 > vault CLAUDE.md > `~/.claude/CLAUDE.md`(全局)。全局的 Hard Gates 任何情况下不被覆盖。
> 本文件只写已对照 `origin/main`(2026-08-11 核实,head ecc72e8 之后)核实过的事实。未核实的声明不写。
> GitHub 仓库名是 `ericzheng-lab/ai-drsfilms-portfolio`,与本机本地文件夹名 `ai-dsrfilms-com` 不一致 —— 引用时注意区分,不要假设两者字面一致。

## ⚠️ 这是生产站点,push 到 main = 自动生产部署

`ai.drsfilms.com` 是**已上线的真实生产站点**。`.github/workflows/deploy.yml` 核实:任何 push 到 `main` 都会触发 GitHub Actions 自动 `npm ci --legacy-peer-deps && npm run build`,再用 `cloudflare/pages-action@v1` 部署到 Cloudflare Pages(`projectName: ai-drsfilms`)—— **没有中间人工确认步骤,merge PR 那一刻就是生产部署那一刻**。

这意味着:全局 Hard Gate 的"merge 到 main"与"生产部署"在这个仓库是同一个动作,不是先 merge 再单独等 Eric 点部署。**任何 merge 到 main 的请求,必须按生产部署对待去征求 Eric 批准**,不能因为"只是 merge 一个文档 PR"而降级处理。

## 这是什么

AI 作品展示站(`package.json` name = `ai-portfolio-site`)。栈:React 18.3.1 + Vite 6.3.5 + TypeScript 5.8.3 + Three.js 生态(**这个仓库确实用 R3F**:`@react-three/fiber` ^8.18、`@react-three/drei` ^9.122、`@react-three/postprocessing` ^3.0.4、`three` ^0.184.0 —— 与 ai-film-studio 那个"没有 R3F 只有裸 three"的结论无关,两个仓库栈不同,不要混淆)。

静态路由约定:每个子页面是 `public/<route>/index.html` 下的独立静态文件夹(已核实存在的路由:`alibaba-startup` / `amazon` / `amazon-creator` / `ascap` / `braze` / `cloudflare` / `code-theory` / `elevenlabs` / `google` / `hims` / `luma` / `meta` / `meta-voice` / `prompt-builder` / `prompt-builder-next` / `TTL-BP` / `wonder`)。改动某一路由时不要触碰其他既有路由(见 `LOOP-STATE.md` 的历史 guardrail:"Do not alter existing portfolio routes")。

## 开工先读

- 本文件
- `LOOP-STATE.md` —— 存在,记录的是最近一次已完成的 L2 loop(Alibaba Startup Deck,PR #10,已 squash-merge 为 `71a37122e12157c42c4c79164cd1834efdb8bce4`,production 已核实 2026-08-11T03:41Z)。这是历史记录,不是进行中状态;新的多步任务开始时按协议新建/覆盖。
- `WEBSITE_CONTEXT.md` —— **内容含已过期的绝对路径**,已核实:文中项目路径写的是 `/Users/yuezheng/Documents/New project 3/ai-portfolio-site`,与本机实际 clone 路径 `~/Documents/EZ_Github/ai-dsrfilms-com` 不符;文中 vault 路径缺少 `Other computers/My MacBook Air` 这一级、且带了不存在的 `Documents/` 层级,与全局 CLAUDE.md 记录的真实 vault 路径矛盾。**按这份文件里的路径操作前先核实路径是否还存在**,不要假设它是最新的。本次任务未修改此文件(超出本 PR 范围)。
- `CONTENT_INVENTORY.md` —— 内容清单,未逐条核实,按需读取。

## 设计锁

⚠️ **main 上没有 DESIGN.md**。已核实存在于 `origin/feat/design-p0-contracts` 分支(**无关联 PR**,`gh pr list --search head:feat/design-p0-contracts` 返回空):首行 `# drsfilms(ai.drsfilms.com)· DESIGN.md — Cinematic Dark 品牌设计合同 v1`。该文件自带一条品牌特例声明:**本仓的 film-grain 微纹理与单一金琥珀强调是允许项(品牌签名)**,与 CODA/prompt-builder 等仓库的通用禁则不同 —— 套用其他仓库的设计规则前先确认这条特例。

**动视觉之前先确认这份草稿是否已是 Eric 认可的方向,不要默认它已生效。**

## 已知坑与注意事项

### ① 本地 clone 有一个过期分支陷阱

`v2-content-refresh` 分支落后 `origin/main` 98 个 commit(仅领先 1 个未合并 commit),是废弃分支。**新工作一律从 `origin/main` 切分支,不要用本地 `v2-content-refresh` 或本地 `main` 作为起点。**

### ② `public/` 下已有内容与 LOOP-STATE 的隐私 guardrail 并存

`LOOP-STATE.md` 记录的 Alibaba Deck loop 明确写了"No BP, top sheet, financing material, private credentials..."的禁入清单,但 `public/` 目录下已经存在一个 `TTL-BP` 文件夹(先于本次任务存在,未核实其内容是否属于该 guardrail 描述的敏感材料)。**不要假设 `public/` 下现有内容都是安全公开的,新增内容前对照这条 guardrail 自查,不要因为看到已有先例就跟进添加类似材料。**

### ③ CI 与本机 node 版本不完全一致

`.github/workflows/deploy.yml` 固定 `node-version: '20'`。本次验证在本机 nvm 默认版本(22.22.2)下跑通 `npm ci --legacy-peer-deps && npm run build`,**未在 node 20 环境下实测**。本 PR 新增的 `.nvmrc` 固定为 `20` 以匹配 CI/部署流水线,而非本机默认版本 —— 如果本地用 nvm 切到这个版本后构建行为有差异,以 CI 实际结果为准。

## 构建与验证

```bash
npm ci --legacy-peer-deps   # ✅ 实测通过(152 packages)。与 CI 完全一致的安装命令。
                             # 注:本次测试中不带 --legacy-peer-deps 的 npm ci 同样成功(exit 0,无 peer 冲突),
                             # 但 CI 固定用 --legacy-peer-deps,本地复现构建请照抄 CI 命令,不要图省事去掉这个 flag。
npm run build                # ✅ 实测通过(vite build,~2.1s;有 1 个 >500KB chunk 的警告,未处理,不阻断构建)
npm run dev                  # vite
npm run preview              # vite preview
```

4 个 npm audit 提示(1 low/3 high),未做安全审计,不在本次任务范围。

## Release Gate

自主可做:只读审计 · feature branch · commit/push · Draft PR · CI(注意本仓 CI 本身就是生产部署,见上文警告)
必须等 Eric 明确批准:**merge 到 main(= 生产部署,两者是同一动作)** · 破坏性操作 · 意外付费
`push ≠ live` 在别的仓库成立,但**在本仓 merge 到 main 之后几分钟内就会是 live** —— 报告完成前仍需去 `ai.drsfilms.com` 对应路由核实实际生效,不能只看 Actions 跑绿就当完成。

## LOOP-STATE 协议

多步施工:判级(L0/L1/L2)→ 机器可验 DoD → 短 loop(计划→做→验证→修正)→ 每 loop commit。
状态外置到 `LOOP-STATE.md` 并随 commit 走。**本仓因为 merge=部署,几乎所有触及 `public/` 路由或构建产物的改动都应按 L2 对待**(即使看起来只是加一个新静态子页面),Loop 0 快照 + 独立盲审到 clean 都不能省。
