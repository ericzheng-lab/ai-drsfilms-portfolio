# drsfilms(ai.drsfilms.com)· DESIGN.md — Cinematic Dark 品牌设计合同 v1

> **本文件是设计合同(single source of truth)**,适用于 ai.drsfilms.com 现站与规划中的 Astro 重建站(rebuild plan B),以及以 drsfilms 署名的品牌物料(封面/brand frames/deck)。
> 配套 tokens:`design-tokens.css`。
> 状态:**LOCKED** = Eric 已锁定品牌规范;**PROPOSED** = P0 起草默认值。
>
> ⚠️ **品牌特例声明**:本仓 denylist 为品牌定制版——**film-grain 微纹理与单一金琥珀强调在本仓是允许项(且是品牌签名)**,与 CODA/prompt-builder 的通用禁则不同。但两者都有严格用量纪律(见 §2/§6)。

---

## 0. 定位(一句话)

**制片人的名片站**:证明「The Producer Who Builds」——Sundance/Berlinale 级制片履历 × 真正 ship 的 AI 工具。视觉气质 = 电影质感的深暗调、克制、专业;**站点本身的视觉与工程水准就是作品证据**,土/廉价/AI-slop 即负资产。受众:招聘方/猎头(第一)、行业同行(第二)。

## 1. 叙事与语气 — LOCKED

- 第一人称制片人视角,用 budget/schedule/dailies 的行话;具体胜过抽象(可核查的片名、真实数字);失败也是内容。
- **不编造铁律**:不虚构 credits/客户/隶属(历史教训:subagent 两次擅自加 A24——出现即删)。真实弹药:Brief History of A Family(Sundance Grand Jury **Nominee**,永不写 winner)+ Berlinale Panorama、$8M+ 品牌案(Nike/Tencent/Riot/miHoYo/L'Oréal/BMW)、60+ 国发行、流俗地(SIFF PROJECT 2026 + 大麦「海纳百川」荣誉)。
- 禁 AI 腔:「thrilled to announce」「game-changer」「let's dive in」。

## 2. 调色板 — LOCKED

| Token | 值 | 用途 |
|---|---|---|
| `--surface` | `#0d0c0a` | 全局底:深暖黑(**非纯黑 #000**) |
| `--surface-2` | `#141210` | 卡片/分层表面 |
| `--ink` | `#ECE8E1` | 正文:暖白(非纯白) |
| `--ink-muted` | `rgba(236,232,225,.62)` | 次级文字 |
| `--accent-gold` | `#C8A964` | **唯一强调:金琥珀** |
| `--line` | `rgba(236,232,225,.12)` | 分隔线 |

用量纪律(LOCKED):
- **每视图只允许一个强调色(金琥珀)**,细笔画使用(标题点缀/下划线/边框/数据高亮),不做大面积金底。
- **film-grain 微纹理**:透明度 ≤0.04、fixed 覆层、`pointer-events:none`——是质感,不是特效;不得叠加其他纹理。
- 浅色/白底页面 = 禁(品牌是暗调);正文对比 ≥ 7:1(暖白对深暖黑达标)。

## 3. 字型系统 — LOCKED

| 角色 | 字体 | 用法 |
|---|---|---|
| Display | **Cormorant Garamond** | 大标题/电影感陈述;500-600,可斜体 |
| UI/Labels | **Montserrat** | 导航、按钮、caps 标签;500-600,caps 需 letter-spacing ≥0.08em |
| 数据/代码 | mono(IBM Plex Mono 类) | 数字、stats、代码示例;tabular-nums |

注:Cormorant+Montserrat 在**其他产品仓是禁用组合**(旧模板残留),在本仓是**品牌锁定字型**——此为品牌特例的一部分,不得跨仓传染。

## 4. 版式·组件·动效 — LOCKED(原则)+ PROPOSED(细则)

**Astro Islands 原则(LOCKED)**:全站 1-2 个 jaw-drop 签名时刻(cinematic hero:动态 film grain/体积光/鼠标视差/scroll morph,重交互隔离在 island 内),**其余内容克制、快速、专业**;全页炫技 = 廉价。
- Hero 必须是「网页 hero 版式」(导航 + ERIC ZHENG 大标题 + tagline + 底部 stats 行),不是裸电影剧照。
- Stats/数字:mono + tabular-nums,具体数字(片名/金额/国家数)优先于形容词。
- 间距(PROPOSED):基准 8px;区块节奏宽松(电影呼吸感),max-width 1200px,正文侧边留白 ≥5%。
- 动效(PROPOSED):签名时刻可用长镜头式缓动(400-800ms);普通内容 150-250ms;禁 scroll-jacking;`prefers-reduced-motion` 全局尊重。
- 按钮/链接(PROPOSED):细边框 + 金琥珀 hover;直角或 ≤4px 圆角;禁胶囊。

## 5. 子产品关系 — LOCKED

- 子路径产品(如 /prompt-builder)是**独立工作台**:遵守各自 DESIGN.md,不强制继承母站暗调;但气质不得与母站冲突(专业/克制/电影语汇)。
- 母站承载品牌叙事;产品页承载工具;宣传物料(brand frames/封面)用母站语言(深暖底 + 金琥珀 + 统一浏览器视口框)。

## 6. 禁用清单(anti-slop denylist,品牌定制版)— LOCKED,机器可 grep

- **AI-slop 特效**:glowing particles/漂浮粒子、neon orbs/霓虹球、sci-fi 网格地平线、circuit-board 纹理、`hue-rotate` 彩虹动画。
- **廉价感**:全页 parallax 轰炸、每区块都动、`animate-gradient` 循环渐变、999px 胶囊按钮、无差别三列卡片墙。
- **颜色违规**:纯黑 `#000` 大面积底、纯白 `#fff` 底、第二强调色、AI 默认蓝紫 `#3b82f6`/`#6366f1`、紫渐变。
- **字体违规**:Inter/Roboto/Arial/system-ui 品牌字面;Space Grotesk;未按 §3 的任意新字体。
- **grain 滥用**:opacity >0.06 的 grain、多层纹理叠加。
- **文案违规**:§1 禁语;虚构 credits(A24 等)。
- 允许项重申(勿误杀):film-grain(≤0.04)、金琥珀强调、Cormorant Garamond+Montserrat、blur 仅限签名时刻的景深效果(工作面/正文区禁)。

## 7. 实现与验收接口

- 现站 = React/Vite(repo ai-drsfilms-portfolio);重建站 = Astro 新 repo(post-SIFF,归 BRAND)。本合同两者通用;重建时若 BRAND 提出新视觉方向(Editorial/Technical 候选),须先修订本合同并经 Eric 批准。
- 单一写手:合同稳态由实现线维护;美指提议制。
- 验收官:§2 调色/用量、§3 字型、§6 denylist、§1 不编造(credits 比对)= 机器可验/可核查 P0;§4 气质与签名时刻质量 = 结构化人审 P1。

*v1 · 2026-07-18 · P0 铸合同 loop-4(施工正本 cmrr78lrc0dg307adv66x9c2z)· 源规范:Eric 锁定之 drsfilms 品牌 memory(cinematic dark / Astro Islands / 不编造)*
