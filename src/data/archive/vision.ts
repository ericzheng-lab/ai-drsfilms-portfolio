import type { Evidence } from './types';

/**
 * Eric's central thesis — the reason the tools exist. Stated by him in his
 * own words; rendered on the site as vision (his position), never as a
 * factual claim about the industry.
 *
 * PUBLIC-SAFE boundary: the worldview below may render. The strategy layer
 * around it (platform partners, wedges, moats, phases, pricing — still under
 * internal debate in the 「AI 电影制作平台架构」 session) must NEVER appear
 * on any page.
 */

export interface Vision {
  /** His verbatim framing, zh. */
  statementZh: string;
  /** English rendering for the site, built from his sentences. */
  statementEn: string;
  principles: { zh: string; en: string }[];
  evidence: Evidence;
}

export const vision: Vision = {
  statementZh:
    '我想象的未来的电影制作,就是所有的 creative heads 都是在同一个 powerhouse 里面各取所需。现在做的这些事情都是在为那个方向努力。',
  statementEn:
    "Every creative head under one roof, each taking what they need. Film crews wrote the coordination protocol a hundred years ago — I'm teaching it to agents.",
  principles: [
    {
      zh: '每个部门有自己的 agent:制片人有制片人的 agent,美术组有美术组的,摄影、灯光、服化道都一样。',
      en: 'Every department gets its own agent, listed like crew: producer, art, camera, lighting, wardrobe.',
    },
    {
      zh: '剧组本来就是一个 agent 网络:部门制、通告单、日报、签字权层级——一百年打磨好的书面协议,就是 agent 协作的现成蓝本。',
      en: 'Call sheets, dailies, purchase orders, sign-off chains: the paperwork becomes the messages agents exchange.',
    },
    {
      zh: 'Agent 只能提议,人签字才算数;没有批准就没有生成。',
      en: 'Agents propose. People sign. Nothing generates without approval.',
    },
    {
      zh: '项目真相是一套普通文件,所有工具只对同一套文件读写。一切以书面为准。',
      en: "If it isn't in the file, it didn't happen: one spine of files, read and written by every tool.",
    },
  ],
  evidence: {
    source:
      'Eric verbatim (this session, 2026-08-29) + his approved blueprint v0.2 principles in CC session 「AI 电影制作平台架构」 (local_f38ca49e, 2026-08-27) + ai-film-studio docs/ai-film-production-pipeline-v2.svg ("No generation without approval", "One approval can unlock exploration", "Exploration ≠ Master") and docs/ai-film-role-control-v2.svg (role/command chain)',
    verification: 'self',
    note: 'Vision, not fact claims. Strategy layer (partners/wedges/moats/phases) is internal — never render.',
  },
};
