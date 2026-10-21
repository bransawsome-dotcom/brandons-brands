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
    slug: "kurono-tokyo-malachite-anniversary-unboxing",
    title: "Unboxing the Kurono Tokyo Malachite Anniversary Watch",
    date: "2026-10-22",
    category: "Collector story",
    excerpt:
      "Unboxing Kurono Tokyo's 2026 anniversary Malachite: a 37mm steel dress watch with a real stone dial. What's inside and how that dial gets made.",
    body: [
      "Kurono Tokyo's 2026 anniversary watch is a slim 37mm steel dress watch with a dial cut from real malachite, and I got to open one up on camera. [BRANDON: whose watch is this — yours, a friend's, a loaner from a collector? One or two lines on how it ended up in your hands.] Here's what came out of the box, why that green dial is so hard to make, and what I think of it.",
      "## What it is",
      "Kurono Tokyo is the brand from Japanese watchmaker Hajime Asaoka, and the brand calls this piece the Special Projects Malachite, or 'Kujaku-ishi' in Japanese. Kujaku-ishi means 'peacock stone,' because the bands in malachite look like the eye pattern on a peacock's feathers. Kurono describes the watch as a personal study by Asaoka exploring the beauty of natural stone.",
      "It went on sale online on May 28, 2026, in just two order windows, with a strict limit of one watch per customer. The price was $1,850 before VAT and duties, and Kurono's page notes US buyers also owe a baseline tariff of about 10% when the package arrives. Deliveries were expected from July 2026. Both windows are now closed, and Kurono says it's a one-off release that won't be repeated.",
      "## Opening the box",
      "[BRANDON: walk us through the unboxing — the box and packaging, what's included (papers, card, extras), and your first reaction when you saw the dial in person.]",
      "## That malachite dial",
      "The dial is the whole story here. The center is natural malachite, and it's surrounded by a brass outer ring finished in a hand-mixed green copper pigment called rokusho (verdigris in English). Together they form a domed, convex dial. Kurono's point is that the pigment and the stone share the same copper roots, so the two greens belong together.",
      "Making it isn't easy. Malachite grows in round clusters called nodules, so Kurono says each nodule is X-rayed to find its 'eye' before a single cut is made. Only about 2 out of every 10 dials make it through, and the ones Asaoka picks himself carry his vermillion seal on the dial as proof. In his words: 'I did not want to simply use a raw fragment as is. Instead, I wanted to imbue it with my own perspective as a watchmaker.' Every stone is different, so no two dials look the same.",
      "A couple of small details I love: the hour markers are Kanji Eto characters from the Japanese zodiac, and the tips of the minute and seconds hands are bent by hand to follow the curve of the dial and the glass.",
      "## The specs",
      "The case is 37mm of high-polished 316L stainless steel, just 7mm thick on its own and about 11.5mm with the domed sapphire box crystal. Water resistance is 5 ATM, so think splashes, not swimming. Inside is a Miyota 90S5 automatic movement with 24 jewels, beating at 28,800 vibrations per hour with about 40 hours of power reserve. It comes on a calf leather strap with a 20mm lug width that tapers to 16mm at the buckle, and it's made in Japan.",
      "## How it wears",
      "[BRANDON: how does it feel on the wrist? Does 37mm and 7mm thin feel dressy or easy to wear every day? How does the malachite change in different light?]",
      "## Is it worth it?",
      "[BRANDON: your honest verdict — who is this watch for, and would you buy it again at $1,850 (plus tariff)?]",
      "Want to see the stone up close? The unboxing reel is on Instagram at @brandonsbrands17. Brands and collectors who want to collaborate can reach me at collab@brandonsbrands17.com.",
    ],
  },
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
