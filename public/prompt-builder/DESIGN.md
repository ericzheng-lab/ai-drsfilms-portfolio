# prompt-builder · DESIGN.md — 设计合同 v3(One-Sheet + landing hook 与媒体资产回收增补)

> **本文件是设计合同(single source of truth)。** 任何 UI/物料改动必须符合本合同;偏离先修订合同。
> 配套 tokens:`design-tokens.css`(v2)。
> 状态标注:**LOCKED** = 铁律,改动需 Eric 批准;**CURRENT** = 现状转录(迁移基线,≠目标)。
>
> **v2 变更(2026-07-19)**:目标视觉方向经设计生产线 P6-B 实证选定——美指 4 方向 → 机器 lint → 双盲审 → 异构验收官 ACCEPT → **Eric 选定「一号海报 One-Sheet」**。§4 由 TBD 转 LOCKED,验收官 P1 条款(P1-1~P1-5)写入落地约束。

---

## 0. 定位(一句话)

**制片人的 prompt 工作台,而工具本身就是一张作品(One-Sheet)**:艺术影院海报的排版语言——铜版纸白、油墨黑巨字、一道克莱因蓝、片尾字幕式 billing block。面向影视同行(用)与招聘方(围观),portfolio opener,证明「The Producer Who Builds」。

## 1. 受众与场景 — LOCKED

- 使用者:影视同行(导演/制片/概念设计),快速出可用 prompt。
- 围观者:看 Eric portfolio 的招聘方——**界面视觉水准 = 简历水准**。
- 推论:海报冲击力(被围观)与工作台耐受度(日用)并重 → 见 §4「两档音量」。

## 2. 现状(legacy)— CURRENT,迁移目标已定

旧语言(淡紫玻璃:#ede6f2 底/紫蓝绿渐变/14 处 backdrop-filter/14px 圆角/JetBrains Mono)判定废弃,token 全表转录于 `design-tokens.css` legacy 段仅作迁移对照。**迁移目标 = §4 One-Sheet**。新代码/新物料禁止延续 legacy 值。

## 3. 不变量铁律 — LOCKED(与 v1 一致)

1. Prompt/代码文本永远 mono、左对齐、**≥14px**(v2 按选定方向从 13px 收紧)、可全选复制;prompt 输出区对比 ≥7:1。
2. 单一强调色:全站唯一品牌强调 = 克莱因蓝(§4);语义色只做状态反馈。
3. 字体总数 ≤4 且 v2 已顶满(§4 四族),**不得引入第五族**。
4. BYOK/agent 状态可视性:文字+形状表达,不靠颜色单独编码。
5. 性能红线:单文件 ≤360KB;**4 个 Google Fonts 的加载体积计入核算**(验收官 P1-5);动效只用 opacity/transform。
6. 可达性:正文对比 ≥4.5:1;焦点态 2px 实线 outline;`prefers-reduced-motion` 全局尊重。
7. 品牌同宇宙:与 ai.drsfilms.com 母站气质连续(电影语汇、克制、专业)——One-Sheet 的影院海报语汇即桥。

## 4. 目标视觉方向 — LOCKED:一号海报 ONE-SHEET(2026-07-19 Eric 选定)

**概念**:艺术影院一号海报(one-sheet)。工具即作品;0 圆角;纯排版驱动;克莱因蓝是唯一的颜色声明。

### 4.1 调色板(唯一来源见 tokens 文件)
| Token | 值 | 用途 |
|---|---|---|
| `--os-white` | `#FCFBF8` | 铜版纸白底 |
| `--os-ink` | `#101010` | 油墨黑(正文/巨字;对纸白 18.39:1) |
| `--os-gray` | `#55565A` | 版面灰(次级文字) |
| `--os-line` | `#E3E1DA` | 细分隔线 |
| `--os-accent` | `#002FA7` | **克莱因蓝:唯一强调**(交互/选中/关键行动) |

### 4.2 字型(4 族顶满,LOCKED)
| 角色 | 字体 | 纪律 |
|---|---|---|
| 海报巨字 Display | **Anton** | 仅页面级大标题/海报音量场景;**禁用于正文** |
| Billing/窄体标签 | **Oswald** | caps 标签 letter-spacing ≥0.08em;billing block 专用 |
| UI 正文 | **Libre Franklin** | 400/600 |
| Prompt/数据 | **Sometype Mono** | ≥14px,tabular-nums |

**Fallback 纪律(验收官 P1-5)**:品牌角色位的 font stack 中间不得插入 Inter/Roboto/Arial/system-ui(链末位的 `sans-serif`/`monospace` 泛型兜底除外)。字体加载失败的兜底观感必须在实现时人工核对一次。

### 4.3 Signature:Billing Block(片尾字幕微缩排版)
- 「DRS FILMS presents · a PROMPT BUILDER production · written & produced by ERIC ZHENG」式排版,按真实片尾字幕规范用窄体压缩字宽(Oswald + scaleY ≤0.92)。
- **字号 ≥12px、对比达标(验收官 P1-5)**;出现在 landing 页脚、发布封面底部、工具页 about 区——**每视图至多一处**,防 cosplay 化。

### 4.4 两档音量 register(LOCKED,评审共识写入)
| | 海报音量(landing/封面/宣传物料) | 工具音量(app 工作台内页) |
|---|---|---|
| Display | Anton 巨字、大留白、强对比 | Anton 仅页面标题一处,字号收敛 |
| 蓝的用量 | 可做大字/大块 | 只做交互强调细笔画(链接/焦点/选中/主按钮) |
| 密度 | 海报式疏排 | 高密度工作台,行距紧 |
| Billing | 页脚完整版 | 不出现或 about 一处 |
- 工作台八小时耐受优先于炫;违反音量分档 = P1。

### 4.5 几何与动效
- **0 圆角全站**(直角即品牌);边线 1px `--os-line`/`--os-ink`;阴影禁用(层级靠线与留白)。
- 动效:120-200ms ease-out,只动 opacity/transform;页面加载可做一次编排式 stagger(海报音量);工作台内动效克制到反馈级。§4.6 的开篇 hook 是此规则的**唯一豁免区**(hook 容器内允许 WebGL/canvas 连续动画)。

### 4.6 Landing 开篇 Hook — LOCKED(Eric 2026-07-19 增补,全产品线通用规范)

**每个 landing page 必须以 Three.js(或同级高级动画)作为开篇 hook**——一个建立情绪的诗意/概念视觉,不是产品说明。

**负面清单(Eric 原话,出现即 REJECT)**:
1. 不能直观地重复表述功能
2. 不能丑陋
3. 不能数据化
4. 不能土鳖科技感
5. 不能是演示动画

**正面定义**:hook 与产品主题**同构而非图解**(prompt-builder 的主题是「把脑中的画面说清楚」——hook 应表达这个概念的诗意形态,而非展示 chips 怎么点)。
**实现纪律**:库走 CDN(three/gsap 不内联,不计文件预算);hook 严格服从 One-Sheet 色彩语言(纸白/油墨黑/克莱因蓝);`prefers-reduced-motion` 与低端移动设备降级为静态海报帧;首屏可交互不因 hook 明显劣化;hook 之下的页面主体照常遵守 §4.5 动效纪律。

### 4.7 媒体资产回收 — LOCKED(Eric 2026-07-19 增补)

**「永不从零」适用于媒体资产**:repo `release-package/` 内既有宣传资产是 Eric 认可的一等素材,landing 与物料**必须回收利用**,不得用纯排版/线框凭空替代:
- `release-package/demo.mp4`(宣传/演示视频)
- `release-package/PICS/`:audience-who-uses-prompt-builder.jpg / before-after-blank-box-to-chips.jpg / one-scene-four-formats-model-comparison.jpg / preset-library-100-plus-catalog-infographic.jpg / showcase-creative-range-what-can-you-build.jpg
- `release-package/web-shots/builder-direct-mode.png`(当前版本真实界面截图——真实历史资产可用,波 2 换壳后刷新)

媒体走既有 repo/live URL 引用,不打包进单文件预算。新增媒体仍守真实素材铁律(不伪造 UI)。

## 5. 宣传物料 register — LOCKED

- **语言条款(Eric 2026-07-19)**:landing 与对外物料页面文案 **English only,不得出现中文字符**(受众为国际招聘方/同行)。产品内的中英双语是功能卖点,功能描述可写 "English & Chinese",但页面文案本身零 CJK。机器判据:CJK 字符 grep = 0。
- 物料清单:landing 刷新、发布封面/brand frames、HyperFrames 发布视频、X/LinkedIn 配图——全部使用 §4 One-Sheet 语言(海报音量)。
- 素材铁律:真实产品截图出发(脱敏 demo 数据),永不伪造 UI;视频配音 GenerateAudio(TTS),配乐 Eric 自备;禁平台 Veo。
- 消息层归 Marketer Brief;视觉执行归美指;发布过 Eric 审批门。

## 6. 禁用清单(anti-slop denylist)— LOCKED,v2 按选定方向收紧

出现即 REJECT(legacy 存量迁移完成前豁免存量):
**颜色/效果**:`backdrop-filter`/`blur(`;品牌面 `linear-gradient`(紫系尤禁 `#6366f1 #8b5cf6 #a855f7 #8a6aaa`);`#3b82f6`;glow/发光;film-grain;`saturate(`;柔影/任何 box-shadow 模糊;**克莱因蓝之外的第二强调色**。
**几何**:**`border-radius` > 0**(0 圆角是品牌);999px 胶囊;无差别三列卡片墙;装饰 emoji 按钮。
**字体**:第五字体族;Anton 用于正文/段落;品牌角色位出现 Inter/Roboto/Arial/system-ui;JetBrains Mono;Cormorant/Montserrat;Space Grotesk。
**排版**:billing block 字号 <12px;billing 每视图 >1 处;工作台内页使用海报音量(巨字/大块蓝)。
**文案**:「Let's dive in」「game-changer」「thrilled to announce」类 AI 腔;首屏无一句说清「给谁/干什么」。

## 7. 实现与验收接口

- 双仓同步纪律:正本 = `ericzheng-lab/prompt-builder`;部署副本 `ai-drsfilms-portfolio/public/prompt-builder/` 两仓 commit 同步(合同只入正本仓)。
- 单一写手:合同稳态由实现线维护;美指以文件提议修订。
- 验收官复测清单(落地时):①概念/成品 HTML 跑 `lint-anti-slop.py --repo prompt-builder` ②billing 实测 ≥12px+对比 ③4 字体加载 KB 纳入 360KB 核算 ④font stack 无品牌位 Inter ⑤工具音量内页无海报式排版。
- 违反 LOCKED = P0;违反音量分档/billing 细则 = P1。

*v3 · 2026-07-19 · 增补 §4.6 landing hook(Eric 负面清单)+ §4.7 媒体资产回收(波 1 rev1 REJECT 教训:老宣传图/视频未回收)· v2(One-Sheet 定案)@cbdfa203 · v1(过渡合同)@7bed1355*
