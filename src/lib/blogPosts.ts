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
    title: "Windup Watch Fair NYC 2026: The Recap",
    date: "2026-10-19",
    category: "Event recap",
    excerpt:
      "Windup NYC 2026 filled Center415 with independent and microbrand watches. Here's what the fair was like and the new releases people talked about.",
    body: [
      "Windup Watch Fair took over Center415 on Fifth Avenue from October 16 to 18, right in the middle of New York Watch Week. It's free and open to everyone, and it's built for trying watches on: dozens of brands, mostly independents and microbrands, often with the founders standing right behind the table. If you missed it, here's the quick version.",
      "## What the fair is like",
      "Windup is all about handling the watches, not looking at them through glass. Alongside the brand tables there are panel talks with journalists and designers, watchmaking demonstrations, strap-change bars and meetups after hours. Brands on the list this year included Bremont, Christopher Ward, Oris, Baltic, Farer, Formex, Lorier, Nezumi, Serica, Spinnaker, Squale and Yema, plus a separate area for everyday-carry gear.",
      "## New watches that made news",
      "A few releases had people talking all week. MING showed the Donut Jelly, a playful watch with a pink-and-red center dial, priced at $649 and debuted at Windup. Brew's Metric Chrono Taxi brings New York taxi yellow and a checkerboard pattern to its chronograph for $495, launching October 19. And Grandeur USA brought its TorQ Mechanical, a skeletonized 35mm tonneau watch in forged carbon or tantalum with a bracelet inspired by tire treads.",
      "The big theme: color and personality. From pink dials to taxi yellow, independent brands are having fun, and that is exactly what makes a fair like Windup worth the trip.",
      "If you went, I'd love to see what was on your wrist: post it on the [Wrist Check wall](/wrist-check) and you might be the Wrist Check of the Week. Planning ahead for next year? The [Windup guide](/blog/windup-watch-fair-2026-nyc-guide-to-oct-16-18-at-center415) covers how the fair works.",
      "Want to see the watches move? Follow along on Instagram at @brandonsbrands17. Brands and collectors who want to collaborate can reach me at collab@brandonsbrands17.com.",
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
