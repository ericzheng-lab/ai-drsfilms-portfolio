import type { PressItem } from './types';

/**
 * Press with working URLs — display-safe fields only. Check dates, HTTP
 * statuses, negative findings (which outlets have NO coverage) and photo
 * notes live in sources.ts.
 *
 * Display rule: one line per outlet, quoted or neutrally described, linked
 * to the original. These reviews praise the FILM — copy must present them
 * as the film's reception, not as personal endorsements of Eric.
 */

export const press: PressItem[] = [
  {
    id: 'variety-review',
    outlet: 'Variety',
    title: "'Brief History of a Family' Review: Suspenseful Chinese Drama",
    url: 'https://variety.com/2024/film/reviews/brief-history-of-a-family-review-1235882108/',
    kind: 'review',
    date: '2024-01',
    supports: 'Variety reviewed the film at Sundance 2024.',
  },
  {
    id: 'thr-review',
    outlet: 'The Hollywood Reporter',
    title: "'Brief History of a Family' Review: A Subtle Psychological Thriller",
    url: 'https://www.hollywoodreporter.com/movies/movie-reviews/brief-history-of-a-family-review-1235830071/',
    kind: 'review',
    date: '2024-01',
    supports: 'THR reviewed the film at Sundance 2024.',
  },
  {
    id: 'screendaily-review',
    outlet: 'Screen Daily',
    title: "'Brief History Of A Family': Sundance Review",
    url: 'https://www.screendaily.com/reviews/brief-history-of-a-family-sundance-review/5189657.article',
    kind: 'review',
    date: '2024-01',
    supports: 'Screen Daily reviewed the film at Sundance 2024.',
  },
  {
    id: 'filmstage-review',
    outlet: 'The Film Stage',
    title: 'Sundance Review: Brief History of a Family is an Elegant Tale About the Chaos of Creation',
    url: 'https://thefilmstage.com/sundance-review-brief-history-of-a-family-is-an-elegant-tale-about-the-chaos-of-creation/',
    kind: 'review',
    date: '2024-01',
    supports: 'The Film Stage reviewed the film at Sundance 2024.',
  },
  {
    id: 'scmp-review',
    outlet: 'South China Morning Post',
    title:
      "Sundance 2024: Brief History of a Family – Chinese drama exposing tensions in a 'perfect' post-one-child-policy family is impersonal and unsettling",
    url: 'https://www.scmp.com/lifestyle/entertainment/article/3248865/sundance-2024-brief-history-family-chinese-drama-exposing-tensions-perfect-post-one-child-policy',
    kind: 'review',
    date: '2024-01',
    supports: 'SCMP reviewed the film at Sundance 2024.',
  },
  {
    id: 'paste-review',
    outlet: 'Paste Magazine',
    title: 'Brief History of a Family Review: Smile While You Squirm',
    url: 'https://www.pastemagazine.com/movies/sundance-2024/brief-history-of-a-family-review',
    kind: 'review',
    date: '2024-01',
    supports: 'Paste reviewed the film at Sundance 2024.',
  },
  {
    id: 'variety-debut-news',
    outlet: 'Variety',
    title: "Sundance: China's Lin Jianjie Debuts 'Brief History of a Family'",
    url: 'https://variety.com/2024/film/news/china-sundance-lin-jianjie-brief-history-of-a-family-1235880076/',
    kind: 'news',
    date: '2024-01',
    supports: 'Trade coverage of the Sundance premiere.',
  },
  {
    id: 'variety-trailer-news',
    outlet: 'Variety',
    title: "'Brief History of a Family' Debuts Trailer Following Sundance Premiere",
    url: 'https://variety.com/2024/film/global/brief-history-of-a-family-films-boutique-sundance-1235883828/',
    kind: 'news',
    date: '2024-01',
    supports: 'Trade coverage after the Sundance premiere; Films Boutique (world sales) appears in the coverage.',
  },
  {
    id: 'wikipedia-film',
    outlet: 'Wikipedia',
    title: 'Brief History of a Family',
    url: 'https://en.wikipedia.org/wiki/Brief_History_of_a_Family',
    kind: 'news',
    supports: 'Awards table, producer trio, production companies.',
  },
  {
    id: 'lbb-eric-joins-ff',
    outlet: 'LBBOnline',
    title: 'Eric Zheng Joins Final Frontier as Executive Producer',
    url: 'https://lbbonline.com/news/eric-zheng-joins-final-frontier-as-executive-producer',
    kind: 'credit',
    date: '2024-09-13',
    supports:
      'Names Eric directly: Shanghai HQ executive producer; "over 13 years of experience"; "more than 50 credits"; Gold House member; at Final Frontier from 2022, lead producer to executive producer; brands incl. NIKE, miHoYo, Tencent, NetEase.',
  },
  {
    id: 'lbb-naraka',
    outlet: 'LBBOnline',
    title: 'Final Frontier Crafts Mixed-Media Sporting Showcase for Naraka: Bladepoint',
    url: 'https://lbbonline.com/news/final-frontier-crafts-mixed-media-sporting-showcase-for-naraka-bladepoint',
    kind: 'credit',
    date: '2024-01-08',
    supports:
      'Quotes "Final Frontier executive producer Eric Zheng" on the NetEase Naraka: Bladepoint Asian Games film.',
  },
  {
    id: 'stash-naraka',
    outlet: 'Stash',
    title: 'Zombie Studio and Final Frontier Mash It Up for Naraka: Bladepoint and the Asian Games',
    url: 'https://www.stashmedia.tv/zombie-studio-and-final-frontier-mash-it-up-for-naraka-bladepoint-and-the-asian-games/',
    kind: 'news',
    date: '2024-01',
    supports: 'Second independent outlet on the Naraka Asian Games film.',
  },
];
