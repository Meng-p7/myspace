/**
 * The journal content.
 *
 * Every page of the original notebook is here, word for word, in both
 * languages. The old site stored them as HTML strings; they are now plain
 * fields so the 3D book can place them and the HTML panel can render them
 * without ever injecting markup.
 */

export type JournalPage = {
  id: string;
  sceneId: number;
  pageNumber: number;
  kicker: string;
  kickerRight: string;
  title?: string;
  body?: string;
  quote?: string;
  image?: { src: string; alt: string; caption: string };
  handnote?: string;
  sign?: string;
};

export type Locale = "zh" | "en";

export type SceneDef = {
  id: number;
  key: string;
  name: Record<Locale, string>;
  mood: Record<Locale, string>;
  pages: string[];
};

export const SCENES: SceneDef[] = [
  {
    id: 0,
    key: "first-build",
    name: { zh: "起点", en: "First Build" },
    mood: { zh: "一根杜邦线，一块板子", en: "One jumper wire, one board" },
    pages: ["p01", "p02"],
  },
  {
    id: 1,
    key: "the-lab",
    name: { zh: "探索", en: "The Lab" },
    mood: { zh: "会抓、会放、会安静地坐着", en: "Grasping, releasing, sitting quietly" },
    pages: ["p03", "p04"],
  },
  {
    id: 2,
    key: "with-her",
    name: { zh: "一起", en: "With Her" },
    mood: { zh: "有人一起看这些", en: "Someone to share it with" },
    pages: ["p05", "p06"],
  },
  {
    id: 3,
    key: "elsewhere",
    name: { zh: "远方", en: "Elsewhere" },
    mood: { zh: "把工位关掉，去看别的城市", en: "Shut the desk, go see another city" },
    pages: ["p07", "p08", "p09", "p10"],
  },
];

/**
 * The words live on the MySpace side: the module is handed the pages of the
 * current language so the original journal text stays in one place and the
 * WebGL context never has to be rebuilt to switch language.
 */
export type JournalPageInput = JournalPage;

/** Look a page up by id in the list the site handed over. */
export const pageById = (pages: JournalPage[], id: string): JournalPage | undefined =>
  pages.find((p) => p.id === id);
