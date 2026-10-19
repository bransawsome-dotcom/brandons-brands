// Blog posts for the /blog page.
//
// To add a post: copy one of the objects below, paste it at the TOP of the
// list (newest first), and change the slug, title, date, excerpt and body.
// - slug: the web address, e.g. "my-new-post" -> /blog/my-new-post
//   (lowercase letters, numbers and dashes only; must be unique)
// - date: YYYY-MM-DD
// - body: one string per paragraph

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "windup-nyc-2026-recap-what-brandon-saw",
    title: "What I Saw at Windup Watch Fair NYC 2026",
    date: "2026-10-21",
    category: "Event recap",
    excerpt:
      "Three days, dozens of independent brands and a lot of colorful dials. Here are the watches that stood out to me at Windup NYC 2026.",
    body: [
      "[BRANDON: one or two sentences in your own words: which day(s) you went, who you went with (The Watch Collective of NJ?), and the first thing you noticed when you walked in.]",
      "Windup Watch Fair took over Center415 on Fifth Avenue from October 16 to 18, right in the middle of New York Watch Week. It's free and open to everyone, and it's built for trying watches on: dozens of brands, mostly independents and microbrands, with the founders often standing right behind the table. If you missed it, this is the next best thing.",
      "## The watches that stood out",
      "[BRANDON: your 3–5 picks, one short paragraph each, most unusual first. For each: brand and model, what caught your eye, how it wore on the wrist, and the price if you know it. Link each one to its reel when it's posted.]",
      "## New watches that made news this week",
      "A few releases had people talking all week. MING showed the Donut Jelly, a playful watch with a pink-and-red center dial, priced at $649 and debuted at Windup. Brew's Metric Chrono Taxi brings New York taxi yellow and a checkerboard pattern to its chronograph for $495, launching October 19. And Grandeur USA brought its TorQ Mechanical, a skeletonized 35mm tonneau watch in forged carbon or tantalum with a bracelet inspired by tire treads.",
      "[BRANDON: did you see any of these in person? If so, add one line on each; if not, delete this note.]",
      "## What I noticed about the fair",
      "[BRANDON: one or two things that surprised you: a trend you kept seeing (colors, small sizes, titanium?), a founder conversation you enjoyed, or the strap bar and panels.]",
      "If you went too, I'd love to see what was on your wrist: post it on the [Wrist Check wall](/wrist-check) and you might be the Wrist Check of the Week. Planning ahead for next year? My [Windup guide](/blog/windup-watch-fair-2026-nyc-guide-to-oct-16-18-at-center415) covers how the fair works.",
      "Want to see these watches move? The Windup reels are on Instagram at @brandonsbrands17. Brands and collectors who want to collaborate can reach me at collab@brandonsbrands17.com.",
    ],
  },
  {
    slug: "tudor-black-bay-58-burgundy-review",
    title: "Tudor Black Bay 58 Burgundy: The 15-Second Review, Expanded",
    date: "2026-10-15",
    category: "Hands-on review",
    excerpt:
      "My 15-second reel on the Tudor Black Bay 58 Burgundy only scratched the surface. Here's the full story: the specs, the history and what's new inside.",
    body: [
      "If you caught my 15-second reel on the Tudor Black Bay 58 Burgundy, you already know I'm a fan. Fifteen seconds isn't a lot of time, though, so here's the longer version: what this watch is, where the color comes from, what changed under the hood, and whether I think it's worth it. Short answer: if you want a classic-sized Tudor diver with a color you won't see on every wrist, this one deserves a look.",
      "First, the basics. The Black Bay 58 Burgundy (reference M7939A1A0RU) was introduced at Watches & Wonders 2025. It's a 39mm stainless steel dive watch with 200 meters of water resistance, a sapphire crystal, a screw-down crown and a 20mm lug width. The dial is a sunburst burgundy, and the bezel insert is burgundy aluminum to match. The hands are Tudor's signature 'Snowflake' style, and the markers are filled with Super-LumiNova.",
      "That all-burgundy look isn't just a fun color choice. Tudor based it on a prototype Submariner, reference 79190, that the brand worked on in the 1990s but never put into production. So this is a design that sat in a drawer for about thirty years before finally getting its moment. I love that kind of backstory — it's the stuff that makes collecting fun.",
      "The bigger news is inside. This Black Bay 58 runs on Tudor's manufacture calibre MT5400, an automatic movement with a silicon hairspring and a power reserve of about 65 hours. It's also certified as a Master Chronometer by METAS, the Swiss Federal Institute of Metrology. That certification is tougher than a standard chronometer test: METAS asks for a daily rate of 0 to +5 seconds and resistance to magnetic fields of up to 15,000 gauss. In plain English, it should keep excellent time and shrug off the magnets in your phone, laptop and bag.",
      "You can get it three ways: a five-link bracelet, a riveted three-link bracelet that nods to vintage Tudor, or a black rubber strap. All three use Tudor's T-fit clasp, which lets you adjust the fit on the fly without tools. At launch, US list prices were about $4,300 on rubber and about $4,500 on the riveted bracelet, with the five-link bracelet a bit higher. Prices can move, so check with an authorized dealer for today's number. Tudor also backs it with a five-year transferable guarantee.",
      "Want to see it move? Watch the reel on Instagram at @brandonsbrands17. And if you're a brand or collector with a watch you'd like us to feature, reach out at collab@brandonsbrands17.com.",
    ],
  },
  {
    slug: "welcome-to-the-brandons-brands-blog",
    title: "Welcome to the Brandon's Brands Blog",
    date: "2026-10-07",
    category: "News",
    excerpt:
      "Watch stories, collecting tips, and behind-the-scenes looks at the pieces in the collection — all in one place.",
    body: [
      "Welcome to the Brandon's Brands blog. This is where we'll share the stories behind the watches — what makes a piece special, how it fits into the collection, and what caught our eye this month.",
      "Expect collector insights, styling ideas, new arrivals, and the occasional deep dive into a classic movement. If you've been following along on Instagram, think of this as the long-form companion to the reels.",
      "Have a watch you'd like us to write about? Reach out at collab@brandonsbrands17.com — we'd love to hear from you.",
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function formatPostDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
