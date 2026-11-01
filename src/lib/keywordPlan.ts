// Monthly keyword plan from the competitor keyword research (the "Competitor Keyword Research" doc).
// The Monday blog draft for a week listed here targets that week's keyword; other weeks use the normal theme rotation.
// The monthly keyword task adds the next month's weeks here. weekOf = the Monday the draft is written (YYYY-MM-DD).

export type KeywordWeek = {
  weekOf: string;
  keyword: string; // main search phrase to rank for
  topic: string; // what the post is about
  link: string; // the site page the post should send readers to
};

export const keywordPlan: KeywordWeek[] = [
  {
    weekOf: "2026-10-12",
    keyword: "windup watch fair 2026",
    topic: "Windup Watch Fair NYC, Oct 16–18, 2026 at Center415: what it is, which microbrands to see, tips for visiting (free entry), and why it's the best microbrand show for New Jersey and New York collectors",
    link: "/events",
  },
  {
    weekOf: "2026-10-19",
    keyword: "inexpensive mechanical watches",
    topic: "Why your first mechanical watch can cost under $500: what you get from an affordable automatic, and a few standout picks",
    link: "/learn/affordable-mechanical-watches",
  },
  {
    weekOf: "2026-10-26",
    keyword: "how much is my watch worth",
    topic: "How much is my watch worth? The things that set a watch's resale value (model, condition, box and papers, service history, market demand) and how to track it",
    link: "/watch-value-tracker",
  },
  {
    weekOf: "2026-11-02",
    keyword: "seiko turtle",
    topic: "The Seiko Turtle: the history of the cushion-case diver and how to choose between today's versions",
    link: "/learn/affordable-mechanical-watches",
  },
  {
    weekOf: "2026-11-09",
    keyword: "best watches under 200",
    topic: "Watch gifts under $200: fun, tough, easy-to-love watches that make great stocking stuffers, and how to pick one for someone else",
    link: "/learn/best-watches-by-budget",
  },
  {
    weekOf: "2026-11-16",
    keyword: "watch gift ideas",
    topic: "Holiday watch gift ideas at every budget: how to find out their style and size quietly, safe choices, engraving, and ordering in time for the holidays",
    link: "/learn/buying-a-watch-as-a-gift",
  },
  {
    weekOf: "2026-11-23",
    keyword: "best watches under 1000",
    topic: "Microbrand watches as gifts: why a small independent maker's diver, GMT or field watch under $1,000 is a thoughtful present, and why to order early (small batches sell out)",
    link: "/learn/best-microbrand-watches-under-1000",
  },
  {
    weekOf: "2026-11-30",
    keyword: "how to buy a pre-owned watch",
    topic: "Shopping pre-owned this holiday season: how to buy a pre-owned watch safely (seller reputation, box and papers, service history, condition, returns)",
    link: "/learn/buying-pre-owned-watches-safely",
  },
];

// The plan entry for the week containing this date, if any.
export function keywordForDate(d = new Date()): KeywordWeek | null {
  const day = 24 * 3600 * 1000;
  return (
    keywordPlan.find((k) => {
      const start = Date.parse(`${k.weekOf}T00:00:00-05:00`);
      return d.getTime() >= start - day && d.getTime() < start + 6 * day;
    }) ?? null
  );
}
