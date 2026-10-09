// Education ("Learn") guides: buying guides, watch types, how watches work and watch history.
//
// To add a guide: copy one of the objects below, give it a unique slug (lowercase-with-dashes),
// pick a category, and write the sections. Each section has a heading and paragraphs; bullets are optional.

export type LearnCategory = "Buying Guides" | "Watch Types" | "How Watches Work" | "Collecting & Community" | "Watch History";

export type LearnSection = { heading: string; paragraphs: string[]; bullets?: string[] };

export type LearnGuide = {
  slug: string;
  title: string;
  category: LearnCategory;
  description: string; // one or two sentences; also the search-engine description
  minutes: number; // reading time
  updated: string; // YYYY-MM-DD
  sections: LearnSection[];
  related?: { label: string; href: string }[];
};

export const LEARN_CATEGORIES: { name: LearnCategory; icon: string; blurb: string }[] = [
  { name: "Buying Guides", icon: "🛒", blurb: "How to choose, size, check and buy a watch with confidence." },
  { name: "Watch Types", icon: "⌚", blurb: "Divers, pilots, chronographs, GMTs and the complications inside them." },
  { name: "How Watches Work", icon: "⚙️", blurb: "Mechanical, automatic and quartz movements, plus the words collectors use." },
  { name: "Collecting & Community", icon: "🤝", blurb: "Starting a collection, what holds value, and where to meet other collectors." },
  { name: "Watch History", icon: "📜", blurb: "From pocket watches to the quartz crisis and the icons that shaped collecting." },
];

export const learnGuides: LearnGuide[] = [
  {
    slug: "buying-your-first-luxury-watch",
    title: "How to Buy Your First Luxury Watch",
    category: "Buying Guides",
    description: "A step-by-step guide to choosing your first luxury watch: setting a budget, picking a style, new vs pre-owned, and what to check before you buy.",
    minutes: 6,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Start with how you'll wear it",
        paragraphs: [
          "The best first luxury watch is the one you'll actually wear. Think about your week: office, weekends outdoors, the gym, the pool, dressy events. A steel sports watch with a bracelet and 100m of water resistance covers almost everything, which is why models like the Rolex Submariner, Omega Seamaster, Tudor Black Bay and Grand Seiko sport pieces are such popular first choices.",
          "If you mostly wear suits, a slim dress watch on a leather strap may make more sense. If you travel, a GMT that tracks a second time zone is genuinely useful.",
        ],
      },
      {
        heading: "Set a realistic budget",
        paragraphs: [
          "Decide on a number before you start browsing, and remember to leave room for sales tax, insurance and an eventual service (typically every five to ten years for a mechanical watch).",
          "Great watches exist at every level. Independent microbrands offer excellent quality for a few hundred to a few thousand dollars, established luxury houses usually start around a few thousand, and haute horlogerie goes far beyond that.",
        ],
      },
      {
        heading: "New, pre-owned or grey market?",
        paragraphs: [
          "Buying new from an authorized dealer gets you the full manufacturer warranty and the box and papers, but popular models can have waiting lists. Pre-owned watches from reputable dealers are often cheaper, available right away, and may already be discontinued references collectors want.",
          "Grey-market dealers sell new watches outside the brand's official network, often at a discount or premium. Warranty terms vary, so ask exactly what's covered.",
        ],
      },
      {
        heading: "What to check before you buy",
        paragraphs: ["Whether you buy new or pre-owned, a few checks protect you:"],
        bullets: [
          "Box and papers (warranty card) that match the serial number",
          "Service history, especially for watches more than five years old",
          "Condition of the case, crystal, bracelet and clasp; ask for clear photos",
          "Whether the bracelet has been sized and if extra links are included",
          "The seller's return policy and reputation",
          "Authentication from a trusted third party for higher-value pieces",
        ],
      },
      {
        heading: "Try it on",
        paragraphs: [
          "Case diameter alone doesn't tell you how a watch wears. Lug-to-lug length, thickness and bracelet design matter just as much. Try watches on in person whenever you can, and see our guide to choosing the right watch size.",
          "Once you've found the one, add it to your free collection on Brandon's Brands to track its value, box & papers and service history.",
        ],
      },
    ],
    related: [
      { label: "How to buy a pre-owned watch safely", href: "/learn/buying-pre-owned-watches-safely" },
      { label: "How to choose the right watch size", href: "/learn/choosing-the-right-watch-size" },
      { label: "Ask the community in Buying & Selling Advice", href: "/forum?subject=buying-advice" },
    ],
  },
  {
    slug: "buying-pre-owned-watches-safely",
    title: "How to Buy a Pre-Owned Watch Safely",
    category: "Buying Guides",
    description: "Protect yourself when buying a used luxury watch: box and papers, authentication, safe payment, escrow and the red flags to watch for.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Why buy pre-owned",
        paragraphs: [
          "The pre-owned market lets you skip waiting lists, find discontinued references and often pay less than retail. It also carries more risk, so a little homework goes a long way.",
        ],
      },
      {
        heading: "Box, papers and the full set",
        paragraphs: [
          "A \"full set\" usually means the original box, warranty card or papers, manuals and any extra links. Papers that match the watch's serial number help prove authenticity and provenance, and full sets typically sell for more. A watch without papers isn't necessarily fake, but it deserves extra scrutiny and should cost less.",
        ],
      },
      {
        heading: "Get it authenticated",
        paragraphs: [
          "For higher-value watches, use a seller or platform that offers third-party authentication, or have an independent watchmaker inspect the movement and case. Services such as Chrono24's certified program, eBay's Authenticity Guarantee and specialist pre-owned dealers can reduce your risk.",
        ],
      },
      {
        heading: "Pay safely",
        bullets: [
          "Use a payment method with buyer protection, or an escrow service that only releases money once you've received and checked the watch",
          "Never pay with gift cards, cryptocurrency or wire transfers to someone you haven't verified",
          "Meet in a safe public place, such as a jeweler or bank lobby, for in-person deals",
          "Keep every message, photo and receipt",
        ],
        paragraphs: [],
      },
      {
        heading: "Red flags",
        bullets: [
          "A price far below the market for that reference",
          "Pressure to decide quickly or pay outside the platform",
          "Stock photos instead of real photos, or refusal to send a video",
          "Serial numbers that are hidden, sanded off or don't match the papers",
          "Misaligned dials, sloppy printing or a date window magnifier that doesn't magnify",
        ],
        paragraphs: [],
      },
      {
        heading: "Buying from members",
        paragraphs: [
          "On Brandon's Brands, you can make an offer on watches in public collections, offer to sell a watch someone is seeking, and post in the For Sale and Seeking to Buy forum topics. Brandon's Brands doesn't take part in sales between members, so always follow the steps above.",
        ],
      },
    ],
    related: [
      { label: "For Sale in the forum", href: "/forum?subject=for-sale" },
      { label: "Seeking to Buy in the forum", href: "/forum?subject=seeking-to-buy" },
      { label: "Browse public collections", href: "/collectors" },
    ],
  },
  {
    slug: "choosing-the-right-watch-size",
    title: "How to Choose the Right Watch Size",
    category: "Buying Guides",
    description: "Case diameter, lug-to-lug, thickness and wrist size explained, so your next watch fits and feels right.",
    minutes: 4,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Measure your wrist",
        paragraphs: [
          "Wrap a soft tape measure (or a strip of paper you then measure) around your wrist just above the wrist bone. Many people fall between about 6 and 7.5 inches (15 to 19 cm).",
        ],
      },
      {
        heading: "Lug-to-lug matters most",
        paragraphs: [
          "Lug-to-lug is the distance from the tip of the top lugs to the tip of the bottom lugs. If it's longer than the flat top of your wrist, the watch will overhang and look too big, even if the diameter seems modest. Integrated-bracelet and lugless watches often wear smaller than their diameter suggests.",
        ],
      },
      {
        heading: "Rough size guide",
        paragraphs: ["Use these as starting points, not rules. Personal style always wins."],
        bullets: [
          "Wrists under 6.5 in (16.5 cm): about 34 to 39 mm diameter, lug-to-lug under 46 mm",
          "Wrists 6.5 to 7.25 in (16.5 to 18.5 cm): about 38 to 42 mm, lug-to-lug 46 to 50 mm",
          "Wrists over 7.25 in (18.5 cm): about 41 mm and up",
        ],
      },
      {
        heading: "Thickness and comfort",
        paragraphs: [
          "Dress watches are often under 10 mm thick and slide under a cuff. Dive watches and chronographs are typically 12 to 15 mm. A taller watch can feel bigger than its diameter, while a thin one can carry a larger diameter comfortably.",
          "Strap or bracelet choice changes the look too: a tapering bracelet or a softer strap can make a watch feel smaller and more comfortable.",
        ],
      },
    ],
    related: [{ label: "How to buy your first luxury watch", href: "/learn/buying-your-first-luxury-watch" }],
  },
  {
    slug: "microbrand-watches-guide",
    title: "Microbrand Watches: A Beginner's Guide",
    category: "Buying Guides",
    description: "What microbrand watches are, why collectors love them, and what to look for when buying from an independent brand.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "What is a microbrand?",
        paragraphs: [
          "Microbrands are small, independent watch companies, often founded by enthusiasts, that design watches in-house and sell mostly online or through a handful of retailers. Many launch through pre-orders or crowdfunding and produce limited batches.",
        ],
      },
      {
        heading: "Why collectors love them",
        bullets: [
          "Strong value: sapphire crystals, good movements and solid finishing at accessible prices",
          "Original design and fresh ideas you won't see from the big houses",
          "Direct contact with founders and a real community around each brand",
          "Limited runs, so you're less likely to see your watch on someone else's wrist",
        ],
        paragraphs: [],
      },
      {
        heading: "What to check before you buy",
        bullets: [
          "The movement (for example Seiko/TMI, Miyota, Sellita or ETA) and who services it",
          "Warranty length and where repairs are handled",
          "Reviews from owners and watch publications",
          "Delivery timelines for pre-orders, and the refund policy",
          "Resale: most microbrands are bought to wear and enjoy, not as investments",
        ],
        paragraphs: [],
      },
      {
        heading: "Why microbrands matter to Brandon",
        paragraphs: [
          "Microbrands are at the heart of Brandon's Brands. Brandon Volosov reviews microbrand and independent watches alongside the big names, and many of them appear in Brandon's Favorites. Follow along for hands-on reviews and founder interviews.",
        ],
      },
    ],
    related: [
      { label: "Brandon's Favorites", href: "/favorites" },
      { label: "Why microbrands matter", href: "/about" },
    ],
  },
  {
    slug: "types-of-watches-explained",
    title: "Types of Watches Explained",
    category: "Watch Types",
    description: "Dive, pilot, field, dress, chronograph, GMT and integrated sports watches: what each type is for and the features that define it.",
    minutes: 6,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Dive watches",
        paragraphs: [
          "Built for water, dive watches have strong water resistance (often 200m or more), a screw-down crown, bright luminous markers and a unidirectional rotating bezel for timing a dive. Classic examples include the Rolex Submariner, Blancpain Fifty Fathoms, Omega Seamaster and Tudor Pelagos.",
        ],
      },
      {
        heading: "Pilot (aviator) watches",
        paragraphs: [
          "Pilot watches prioritize legibility: large, high-contrast numerals, oversized crowns that are easy to grip, and often a triangle at 12 o'clock. Some add slide-rule bezels for flight calculations, like the Breitling Navitimer. IWC's Pilot's Watches and German Flieger designs are other familiar examples.",
        ],
      },
      {
        heading: "Field watches",
        paragraphs: [
          "Rooted in military issue, field watches are simple, rugged and readable, usually with a matte dial, Arabic numerals and a fabric or leather strap. The Hamilton Khaki Field is a well-known example, and many microbrands make great ones.",
        ],
      },
      {
        heading: "Dress watches",
        paragraphs: [
          "Dress watches are thin, understated and usually on a leather strap, with a simple dial and few or no complications so they slip under a shirt cuff. Think Patek Philippe Calatrava, Cartier Tank and Jaeger-LeCoultre Reverso.",
        ],
      },
      {
        heading: "Chronographs",
        paragraphs: [
          "A chronograph is a watch with a built-in stopwatch, started and stopped with pushers on the side of the case. Many have a tachymeter scale on the bezel for measuring speed. The Omega Speedmaster and Rolex Daytona are the most famous.",
        ],
      },
      {
        heading: "GMT and travel watches",
        paragraphs: [
          "A GMT watch shows a second time zone, usually with an extra 24-hour hand and a 24-hour bezel. World timers go further and show every time zone at once. The Rolex GMT-Master II and Tudor Black Bay GMT are popular choices.",
        ],
      },
      {
        heading: "Integrated-bracelet sports watches",
        paragraphs: [
          "In these watches the bracelet flows directly from the case with no conventional lugs. Gérald Genta's Audemars Piguet Royal Oak (1972) and Patek Philippe Nautilus (1976) defined the style, and it is now one of the most popular categories in watchmaking.",
        ],
      },
    ],
    related: [
      { label: "Watch complications explained", href: "/learn/watch-complications-explained" },
      { label: "Iconic watches that shaped history", href: "/learn/iconic-watches-that-shaped-history" },
    ],
  },
  {
    slug: "watch-complications-explained",
    title: "Watch Complications Explained",
    category: "Watch Types",
    description: "What a complication is, from date windows and GMTs to moonphases, perpetual calendars, tourbillons and minute repeaters.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "What is a complication?",
        paragraphs: ["A complication is any function a watch performs beyond showing hours, minutes and seconds. Here are the most common, roughly from simplest to most complex."],
      },
      {
        heading: "Everyday complications",
        bullets: [
          "Date: shows the day of the month, usually in a small window",
          "Day-date: adds the day of the week",
          "GMT / dual time: tracks a second time zone",
          "Power reserve indicator: shows how much energy is left in the mainspring",
          "Chronograph: a built-in stopwatch",
        ],
        paragraphs: [],
      },
      {
        heading: "Calendar and astronomical complications",
        bullets: [
          "Moonphase: shows the phase of the moon through a window on the dial",
          "Annual calendar: knows the length of each month, needing correction only once a year at the end of February",
          "Perpetual calendar: accounts for month lengths and leap years, and can stay correct for decades",
        ],
        paragraphs: [],
      },
      {
        heading: "Grand complications",
        bullets: [
          "Tourbillon: a rotating cage for the escapement, invented by Abraham-Louis Breguet and patented in 1801 to average out the effects of gravity",
          "Minute repeater: chimes the time on tiny gongs at the push of a slide",
          "Split-seconds (rattrapante) chronograph: times two events that start together but finish separately",
        ],
        paragraphs: [
          "Watches that combine several of these are among the most complicated mechanical objects ever made by hand.",
        ],
      },
    ],
    related: [{ label: "Mechanical, automatic and quartz explained", href: "/learn/mechanical-automatic-quartz-explained" }],
  },
  {
    slug: "mechanical-automatic-quartz-explained",
    title: "Mechanical vs Automatic vs Quartz: How Watches Work",
    category: "How Watches Work",
    description: "The differences between hand-wound mechanical, automatic (self-winding) and quartz watches, plus hybrids like mecha-quartz and Spring Drive.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Mechanical (hand-wound)",
        paragraphs: [
          "A mechanical watch is powered by a coiled mainspring. As it unwinds, a gear train carries the energy to the escapement and balance wheel, which swings back and forth at a steady rate, letting the hands advance in tiny, even steps. You wind it by turning the crown, usually daily or every few days depending on the power reserve.",
        ],
      },
      {
        heading: "Automatic (self-winding)",
        paragraphs: [
          "An automatic is a mechanical watch with a rotor: a weighted half-disc that spins as you move your wrist and winds the mainspring for you. Wear it regularly and it keeps running; leave it in a drawer and it will stop after its power reserve runs out (often 38 to 80 hours). A watch winder can keep it running between wears.",
        ],
      },
      {
        heading: "Quartz",
        paragraphs: [
          "A quartz watch uses a battery to send current through a tiny quartz crystal that vibrates at 32,768 times per second. A circuit counts those vibrations and drives the hands. Quartz watches are very accurate (often within seconds a month), affordable and low-maintenance, which is why they transformed the industry in the 1970s and 1980s.",
        ],
      },
      {
        heading: "Hybrids",
        bullets: [
          "Mecha-quartz: a quartz movement with a mechanical chronograph module for a crisp, mechanical-feeling stopwatch",
          "Spring Drive (Grand Seiko): a mainspring powers the watch, while a quartz-regulated system controls the speed, giving a perfectly smooth sweeping seconds hand",
          "Solar and kinetic: quartz watches recharged by light or by your movement",
        ],
        paragraphs: [],
      },
      {
        heading: "Which is right for you?",
        paragraphs: [
          "Choose mechanical or automatic if you love craftsmanship and the idea of a tiny machine on your wrist. Choose quartz if you want grab-and-go accuracy with minimal upkeep. Many collectors own both.",
        ],
      },
    ],
    related: [
      { label: "Watch terms glossary", href: "/learn/watch-terms-glossary" },
      { label: "Watch complications explained", href: "/learn/watch-complications-explained" },
    ],
  },
  {
    slug: "watch-terms-glossary",
    title: "Watch Terms Glossary",
    category: "How Watches Work",
    description: "The words collectors use, explained simply: bezel, crown, lugs, lume, sapphire, power reserve, jewels, COSC, water resistance and more.",
    minutes: 6,
    updated: "2026-10-09",
    sections: [
      {
        heading: "The outside of the watch",
        bullets: [
          "Case: the body of the watch that holds the movement",
          "Bezel: the ring around the crystal; it may rotate for timing or a second time zone",
          "Crown: the knob used to set the time and wind the watch; a screw-down crown seals better against water",
          "Lugs: the horns that attach the strap or bracelet to the case",
          "Lug width: the space between the lugs, which tells you which straps fit (for example 20 mm)",
          "Crystal: the clear cover over the dial; sapphire is very scratch-resistant, mineral and acrylic are softer",
          "Caseback: the back of the case; an exhibition caseback has a window to see the movement",
        ],
        paragraphs: [],
      },
      {
        heading: "The dial",
        bullets: [
          "Indices (markers): the hour markers on the dial",
          "Lume: luminous material, such as Super-LumiNova, that glows in the dark",
          "Sub-dial (register): a small dial within the main dial, common on chronographs",
          "Cyclops: the magnifier over a date window",
        ],
        paragraphs: [],
      },
      {
        heading: "The movement",
        bullets: [
          "Movement (caliber): the engine of the watch",
          "In-house: a movement designed and made by the brand itself",
          "Power reserve: how long a fully wound watch runs, often 38 to 80 hours",
          "Jewels: synthetic rubies used as low-friction bearings",
          "Beats per hour (vph): how fast the balance oscillates; 28,800 vph (4 Hz) is common",
          "COSC / chronometer: a watch certified by Switzerland's official chronometer testing institute for accuracy",
        ],
        paragraphs: [],
      },
      {
        heading: "Water resistance, in real life",
        paragraphs: ["Ratings are measured in a lab, so treat them as a guide:"],
        bullets: [
          "30m (3 ATM): splashes and rain, not swimming",
          "50m (5 ATM): brief swimming",
          "100m (10 ATM): swimming and snorkeling",
          "200m and up: diving",
        ],
      },
      {
        heading: "Buying terms",
        bullets: [
          "Full set: the watch with its original box, papers and accessories",
          "Reference (ref.): the model number that identifies a specific version",
          "NOS (new old stock): an older watch that was never sold or worn",
          "Grey market: new watches sold outside the brand's authorized dealer network",
        ],
        paragraphs: [],
      },
    ],
    related: [{ label: "Mechanical vs automatic vs quartz", href: "/learn/mechanical-automatic-quartz-explained" }],
  },
  {
    slug: "history-of-the-wristwatch",
    title: "A Short History of the Wristwatch",
    category: "Watch History",
    description: "From pocket watches to the wrist, the first automatics, the quartz crisis and the mechanical revival: how the modern watch came to be.",
    minutes: 6,
    updated: "2026-10-09",
    sections: [
      {
        heading: "From pocket to wrist",
        paragraphs: [
          "For centuries, portable timekeeping meant pocket watches. Early wristwatches were mostly considered jewelry for women. That began to change in the early 1900s: Cartier designed the Santos in 1904 for aviator Alberto Santos-Dumont, who needed to check the time without letting go of the controls.",
          "World War I made the wristwatch practical for men. Soldiers needed to coordinate timing in the trenches, and \"trench watches\" with wire lugs and protective grilles became common.",
        ],
      },
      {
        heading: "Waterproof and self-winding",
        paragraphs: [
          "In 1926 Rolex introduced the Oyster, a sealed, water-resistant case, and proved it the next year when swimmer Mercedes Gleitze wore one across the English Channel. Self-winding wristwatches followed: John Harwood patented an early design in the 1920s, and in 1931 Rolex launched its Perpetual rotor, the basis of most modern automatic watches.",
        ],
      },
      {
        heading: "The golden age of tool watches",
        paragraphs: [
          "The 1950s and 1960s brought purpose-built watches: divers like the Blancpain Fifty Fathoms and Rolex Submariner (both 1953), the Breitling Navitimer for pilots (1952), and the Omega Speedmaster (1957), which NASA qualified for spaceflight and which was worn on the Moon in 1969.",
        ],
      },
      {
        heading: "The quartz crisis",
        paragraphs: [
          "In December 1969 Seiko released the Astron, the world's first quartz wristwatch. Through the 1970s and early 1980s, cheaper and more accurate quartz watches from Japan and elsewhere hit the Swiss mechanical industry hard, and many historic brands closed or were sold.",
        ],
      },
      {
        heading: "Revival and today",
        paragraphs: [
          "The Swiss industry regrouped. The colorful, affordable Swatch (1983) helped save it, and mechanical watches were reborn as objects of craft, design and emotion rather than pure necessity. Today, historic houses, independent watchmakers and a wave of microbrands make it one of the most exciting times ever to collect watches.",
        ],
      },
    ],
    related: [
      { label: "Iconic watches that shaped history", href: "/learn/iconic-watches-that-shaped-history" },
      { label: "Vintage in the forum", href: "/forum?subject=vintage" },
    ],
  },
  {
    slug: "iconic-watches-that-shaped-history",
    title: "Iconic Watches That Shaped Watch Collecting",
    category: "Watch History",
    description: "The Santos, Tank, Reverso, Submariner, Speedmaster, Daytona, Royal Oak, Nautilus and more: the watches every collector should know.",
    minutes: 6,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Early icons",
        bullets: [
          "Cartier Santos (1904): one of the first purpose-designed men's wristwatches, made for aviator Alberto Santos-Dumont",
          "Cartier Tank (1917): clean rectangular lines inspired by the shape of military tanks",
          "Jaeger-LeCoultre Reverso (1931): a case that flips over to protect the crystal, originally for polo players",
        ],
        paragraphs: [],
      },
      {
        heading: "Tool watch legends",
        bullets: [
          "Blancpain Fifty Fathoms (1953) and Rolex Submariner (1953): the templates for the modern dive watch",
          "Breitling Navitimer (1952): a pilot's chronograph with a slide-rule bezel",
          "Rolex GMT-Master (1954): developed for airline pilots crossing time zones",
          "Omega Speedmaster (1957): the \"Moonwatch\", worn on the lunar surface in 1969",
          "Rolex Cosmograph Daytona (1963): the racing chronograph that became one of the most sought-after watches",
        ],
        paragraphs: [],
      },
      {
        heading: "Design revolutions",
        bullets: [
          "Seiko Astron (1969): the first quartz wristwatch",
          "Audemars Piguet Royal Oak (1972): Gérald Genta's steel luxury sports watch with an integrated bracelet",
          "Patek Philippe Nautilus (1976): Genta's porthole-inspired design, now a collecting icon",
          "Swatch (1983): affordable, playful and credited with helping revive the Swiss industry",
        ],
        paragraphs: [],
      },
      {
        heading: "Why they still matter",
        paragraphs: [
          "Almost every watch made today borrows something from these designs. Knowing them helps you spot influences, understand prices and appreciate what makes a new watch original. See which modern pieces made Brandon's Favorites, and share your own icons in the forum.",
        ],
      },
    ],
    related: [
      { label: "Brandon's Favorites", href: "/favorites" },
      { label: "A short history of the wristwatch", href: "/learn/history-of-the-wristwatch" },
    ],
  },
  {
    slug: "best-watches-by-budget",
    title: "Best Watches Under $500, $1,000 and $5,000",
    category: "Buying Guides",
    description: "Great watches at every budget, from tough everyday watches under $500 to Swiss icons under $5,000, mixing big names with independent microbrands.",
    minutes: 7,
    updated: "2026-10-09",
    sections: [
      {
        heading: "How to use this guide",
        paragraphs: [
          "Prices change often and vary by retailer, strap and version, so treat these as starting points and check the brand's site before you buy. Each tier mixes well-known names with microbrands, because some of the best value in watches today comes from small independent makers.",
        ],
      },
      {
        heading: "Under $500: everyday heroes",
        bullets: [
          "Casio G-Shock: nearly indestructible, with styles from the classic DW-5600 square to the slim GA-2100",
          "Seiko 5 Sports: an automatic sports watch that has introduced millions of people to mechanical watches",
          "Timex Marlin and Q Timex: retro styling and big personality for the price",
          "Brew Metric: a 1970s-inspired 36mm chronograph from an independent New York brand, listed at $475",
          "Orient Bambino: a classic automatic dress watch",
        ],
        paragraphs: [],
      },
      {
        heading: "Under $1,000: serious watches",
        bullets: [
          "Hamilton Khaki Field Mechanical: a hand-wound field watch with real military heritage",
          "Tissot PRX Powermatic 80: an integrated-bracelet design with an 80-hour automatic movement",
          "Seiko Prospex divers: proven dive watches with a huge enthusiast following",
          "Baltic Aquascaphe: a French microbrand diver with vintage charm",
          "Lorier Neptune and Traska Freediver: microbrand divers known for quality well beyond their price",
        ],
        paragraphs: [],
      },
      {
        heading: "Under $5,000: Swiss and Japanese icons",
        bullets: [
          "Tudor Black Bay 58: vintage-inspired diving heritage from Rolex's sister brand",
          "Longines Spirit and HydroConquest: historic Swiss brand, modern build quality",
          "Oris Aquis and Divers Sixty-Five: independent Swiss brand with strong value",
          "Sinn 556 and Nomos Club or Tangente: German engineering and Bauhaus design",
          "Grand Seiko quartz and Heritage models: famous for Zaratsu polishing and dial work",
          "Traska Chronograph: a column-wheel automatic chronograph, listed at $1,650",
        ],
        paragraphs: [],
      },
      {
        heading: "Our advice",
        paragraphs: [
          "Buy the watch you'll wear, not the one that looks best on a spreadsheet. Try things on, read owner reviews, and ask the community before you buy. When it arrives, add it to your collection on Brandon's Brands to track its value and box & papers.",
        ],
      },
    ],
    related: [
      { label: "How to buy your first luxury watch", href: "/learn/buying-your-first-luxury-watch" },
      { label: "Microbrand watches: a beginner's guide", href: "/learn/microbrand-watches-guide" },
      { label: "Brandon's Favorites", href: "/favorites" },
    ],
  },
  {
    slug: "how-to-spot-a-fake-watch",
    title: "How to Spot a Fake Watch",
    category: "Buying Guides",
    description: "A practical checklist for spotting counterfeit luxury watches: price, paperwork, serial numbers, dial printing, the movement and seller red flags.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Start with the deal, not the watch",
        paragraphs: [
          "Most fakes are caught before you ever hold the watch. If the price is far below what that reference sells for, the seller is in a hurry, or they want payment outside a protected platform, walk away. Modern \"super fakes\" can look convincing in photos, so the seller and the paperwork matter as much as the watch.",
        ],
      },
      {
        heading: "Check the paperwork",
        bullets: [
          "The serial number on the papers matches the serial on the watch",
          "Warranty cards and receipts name a real authorized dealer, with a plausible date",
          "Box, booklets and tags match the era of the watch",
          "Service papers come from the brand or a known watchmaker",
        ],
        paragraphs: [],
      },
      {
        heading: "Look closely at the watch",
        bullets: [
          "Dial printing should be crisp and evenly spaced; blurry text, typos or misaligned markers are warning signs",
          "Date magnifiers on genuine watches noticeably enlarge the date",
          "Hands, markers and lume should line up neatly and glow evenly",
          "Engravings should be sharp, not shallow or sandy-looking",
          "The bracelet and clasp should feel solid, with clean finishing and correct stamps",
          "Weight: precious-metal watches feel noticeably heavy",
        ],
        paragraphs: [],
      },
      {
        heading: "The movement tells the truth",
        paragraphs: [
          "A watchmaker can open the caseback and compare the movement with the correct caliber in minutes. For any significant purchase, an independent inspection or third-party authentication is the best money you'll spend.",
        ],
      },
      {
        heading: "Protect yourself",
        paragraphs: [
          "Buy from reputable dealers, use escrow or a platform with buyer protection, and never pay by gift card, crypto or wire to someone you haven't verified. If something feels off, it usually is.",
        ],
      },
    ],
    related: [
      { label: "How to buy a pre-owned watch safely", href: "/learn/buying-pre-owned-watches-safely" },
      { label: "Authentication, Box & Papers in the forum", href: "/forum?subject=authentication" },
    ],
  },
  {
    slug: "rolex-vs-omega-vs-tudor",
    title: "Rolex vs Omega vs Tudor: Which Should You Buy?",
    category: "Buying Guides",
    description: "How Rolex, Omega and Tudor compare on history, movements, accuracy, warranty and value, and how to choose between them.",
    minutes: 6,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Three great choices",
        paragraphs: [
          "Rolex, Omega and Tudor are three of the most popular first luxury watch brands, and you can't really go wrong with any of them. The best choice depends on the model you love, your budget and what matters most to you.",
        ],
      },
      {
        heading: "Rolex",
        paragraphs: [
          "Rolex is the best-known luxury watch brand in the world, famous for the Submariner, Daytona, GMT-Master II and Datejust. Its watches are certified \"Superlative Chronometers\", tested in-house to within -2/+2 seconds a day once cased, and come with a five-year warranty. Popular steel models can be hard to find at retail, and many hold their value well on the pre-owned market.",
        ],
      },
      {
        heading: "Omega",
        paragraphs: [
          "Omega has a rich history in sport and space: the Speedmaster went to the Moon and the brand has long timed the Olympic Games. Many Omega movements are certified Master Chronometers by Switzerland's METAS institute, which tests accuracy and resistance to strong magnetic fields. Omega also offers a five-year warranty and often more variety at a given price than Rolex.",
        ],
      },
      {
        heading: "Tudor",
        paragraphs: [
          "Tudor was founded by Rolex founder Hans Wilsdorf as a more affordable sister brand. Today it makes its own manufacture movements, offers a five-year transferable warranty, and is loved for the Black Bay and Pelagos lines. For many collectors, Tudor is the sweet spot between price, history and build quality.",
        ],
      },
      {
        heading: "How to choose",
        bullets: [
          "Want the most recognizable icon and strong resale? Rolex",
          "Love space history, technical movements and variety? Omega",
          "Want heritage and quality at a more approachable price? Tudor",
          "Most important: pick the specific watch that makes you smile every time you look at it",
        ],
        paragraphs: [],
      },
    ],
    related: [
      { label: "Iconic watches that shaped collecting", href: "/learn/iconic-watches-that-shaped-history" },
      { label: "Rolex in the forum", href: "/forum?subject=brands/rolex" },
      { label: "Omega in the forum", href: "/forum?subject=brands/omega" },
    ],
  },
  {
    slug: "are-watches-a-good-investment",
    title: "Are Watches a Good Investment? What Holds Value",
    category: "Collecting & Community",
    description: "Which watches tend to hold their value, why most don't, and how to buy smart if resale matters to you.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "The honest answer",
        paragraphs: [
          "Most watches lose value the moment they leave the store, just like cars. A small number of models from a few brands have held or increased their value, but markets go up and down, and past prices don't guarantee future ones. Buy watches to wear and enjoy first, and treat any value they keep as a bonus.",
        ],
      },
      {
        heading: "What tends to hold value",
        bullets: [
          "High-demand steel sports models from top brands, especially when supply is limited",
          "Limited editions with genuine collector appeal",
          "Watches from respected independent watchmakers with long waiting lists",
          "Rare vintage references in original condition",
        ],
        paragraphs: [],
      },
      {
        heading: "What protects resale",
        bullets: [
          "Keeping the full set: box, papers, tags and extra links",
          "Avoiding heavy polishing, which softens the case's original lines",
          "Keeping service records",
          "Buying at a fair price in the first place",
        ],
        paragraphs: [],
      },
      {
        heading: "Track it",
        paragraphs: [
          "Your collection on Brandon's Brands shows estimated market values and today's retail price for each watch, refreshed daily, so you always know roughly what your collection is worth. Values are estimates from public listings, not appraisals, and this isn't financial advice.",
        ],
      },
    ],
    related: [
      { label: "How to buy a pre-owned watch safely", href: "/learn/buying-pre-owned-watches-safely" },
      { label: "How to start a watch collection", href: "/learn/how-to-start-a-watch-collection" },
    ],
  },
  {
    slug: "buying-a-watch-as-a-gift",
    title: "How to Buy a Watch as a Gift",
    category: "Buying Guides",
    description: "How to choose a watch someone will love: figuring out their style and size, safe choices, engraving, and making the moment special.",
    minutes: 4,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Find out their style quietly",
        paragraphs: [
          "Notice what they already wear: big or small, gold or steel, leather or bracelet, sporty or dressy. Look at their wrist next to a watch you know the size of, or ask a friend or family member to find out casually.",
        ],
      },
      {
        heading: "Safe, versatile choices",
        bullets: [
          "A steel watch on a bracelet with a simple dial works with almost everything",
          "Medium sizes (about 36 to 40 mm) suit most wrists",
          "A quartz watch is grab-and-go; an automatic is a little more special for someone who loves craftsmanship",
          "A classic from a well-known brand is easy to love and easy to exchange",
        ],
        paragraphs: [],
      },
      {
        heading: "Make it personal",
        paragraphs: [
          "An engraving on the caseback, a date or a short message turns a watch into an heirloom. Check that the caseback can be engraved and that the retailer allows returns on engraved pieces before you commit.",
          "Keep the receipt and warranty card, and ask about sizing: bracelets usually need links removed, which most retailers do for free.",
        ],
      },
    ],
    related: [
      { label: "Best watches under $500, $1,000 and $5,000", href: "/learn/best-watches-by-budget" },
      { label: "How to choose the right watch size", href: "/learn/choosing-the-right-watch-size" },
    ],
  },
  {
    slug: "how-to-care-for-your-watch",
    title: "How to Care for Your Watch: Servicing, Cleaning and Storage",
    category: "How Watches Work",
    description: "Keep your watch running for decades: how often to service it, how to clean it, water resistance tips, magnetism, and storage and watch winders.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Servicing",
        paragraphs: [
          "A mechanical watch is a machine with oils that slowly break down. Most brands recommend a full service every five to ten years; check your watch's manual. Signs it needs attention sooner include losing or gaining a lot of time, a short power reserve, or a crown that feels gritty. Services range from a few hundred dollars to much more for complicated or precious watches.",
          "Quartz watches need a new battery every few years. Replace it promptly, because a dead battery can leak.",
        ],
      },
      {
        heading: "Everyday cleaning",
        bullets: [
          "Wipe the case and crystal with a soft microfiber cloth",
          "Clean a metal bracelet with a soft toothbrush and mild soapy water, only if the watch is water resistant and the crown is closed",
          "Rinse with fresh water after swimming in salt water or a pool",
          "Keep leather straps dry and rotate them to let them breathe",
        ],
        paragraphs: [],
      },
      {
        heading: "Water and magnets",
        paragraphs: [
          "Always push in or screw down the crown before getting a watch wet, and don't press chronograph pushers underwater unless the watch is designed for it. Have water resistance tested at each service, since gaskets age.",
          "Strong magnets in phones, speakers, laptop cases and bag clasps can make a mechanical watch suddenly run very fast. A watchmaker can demagnetize it in seconds.",
        ],
      },
      {
        heading: "Storage and watch winders",
        paragraphs: [
          "Store watches in a dry place, in a case or box where they won't knock together. Automatic watches stop when not worn; a watch winder keeps them running, which is handy for watches with complicated calendars, but it isn't required. Letting an automatic stop occasionally won't harm it.",
        ],
      },
    ],
    related: [
      { label: "How to set and wind your watch", href: "/learn/how-to-set-and-wind-your-watch" },
      { label: "Watch terms glossary", href: "/learn/watch-terms-glossary" },
    ],
  },
  {
    slug: "watch-straps-and-bracelets-explained",
    title: "Watch Straps and Bracelets Explained",
    category: "How Watches Work",
    description: "Leather, rubber, NATO, mesh and metal bracelets compared, plus lug width, quick-release spring bars and how to change a strap.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Why straps matter",
        paragraphs: [
          "Changing the strap is the easiest way to give a watch a whole new personality. The same diver can look dressy on leather, sporty on rubber and casual on a NATO.",
        ],
      },
      {
        heading: "The main types",
        bullets: [
          "Metal bracelets: durable and versatile; styles include Oyster, Jubilee, President and integrated designs",
          "Leather: classic and dressy; avoid water and rotate them to make them last",
          "Rubber and FKM: waterproof, comfortable and ideal for sport and diving",
          "NATO and nylon: inexpensive, colorful and secure, since the watch stays on even if one spring bar fails",
          "Mesh (Milanese): a metal weave with a vintage feel",
          "Sailcloth and canvas: sporty and tough",
        ],
        paragraphs: [],
      },
      {
        heading: "Lug width and sizing",
        paragraphs: [
          "Lug width is the distance between the lugs, usually 18 to 22 mm, and it decides which straps fit. Many straps taper toward the buckle, which can make a watch feel lighter and more comfortable. Bracelets are sized by adding or removing links, and many clasps have micro-adjust positions for fine-tuning.",
        ],
      },
      {
        heading: "Changing a strap",
        paragraphs: [
          "Many modern straps have quick-release spring bars with a small lever, so you can swap them by hand. Otherwise, a spring bar tool does the job in a minute: compress the bar, lift the strap out, and do the reverse with the new one. Work over a soft cloth so nothing scratches or rolls away.",
        ],
      },
    ],
    related: [
      { label: "Straps & Accessories in the forum", href: "/forum?subject=straps" },
      { label: "Watch terms glossary", href: "/learn/watch-terms-glossary" },
    ],
  },
  {
    slug: "how-to-set-and-wind-your-watch",
    title: "How to Set and Wind Your Watch",
    category: "How Watches Work",
    description: "Setting the time and date safely, winding a mechanical watch, using a screw-down crown, and getting an automatic started.",
    minutes: 4,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Know your crown positions",
        paragraphs: [
          "Most watches have up to three crown positions: pushed in (winding, on mechanical watches), pulled out one step (setting the date, or a GMT hand) and pulled out fully (setting the time). If your watch has a screw-down crown, unscrew it counterclockwise until it pops out before you do anything else, and screw it back down gently afterwards.",
        ],
      },
      {
        heading: "Winding a mechanical watch",
        paragraphs: [
          "With the crown in its first position, turn it clockwise (away from you) with smooth, gentle turns. For a manual-wind watch, stop when you feel firm resistance; don't force it. An automatic that has stopped can be started with 20 to 40 turns of the crown, or by gently moving it, and then wearing it keeps it wound.",
        ],
      },
      {
        heading: "Setting the date safely",
        paragraphs: [
          "Many mechanical watches start changing the date in the hours around midnight. Changing the date manually while that mechanism is engaged, roughly between 9 p.m. and 3 a.m. on the dial, can strain or damage some movements. Move the hands to around 6 o'clock first, set the date, then set the time.",
          "Remember that the date changes at midnight, not noon: set the time by moving forward past 12 and checking that the date flips, so you know you're in the morning.",
        ],
      },
      {
        heading: "Quick tips",
        bullets: [
          "Pull the crown fully out at the top of a minute for a precise setting (most mechanical watches stop the seconds hand)",
          "Never operate the crown underwater",
          "Check your manual, since some movements have their own quirks",
        ],
        paragraphs: [],
      },
    ],
    related: [
      { label: "Mechanical vs automatic vs quartz", href: "/learn/mechanical-automatic-quartz-explained" },
      { label: "How to care for your watch", href: "/learn/how-to-care-for-your-watch" },
    ],
  },
  {
    slug: "swiss-vs-japanese-vs-german-watches",
    title: "Swiss vs Japanese vs German Watchmaking",
    category: "Watch Types",
    description: "What \"Swiss Made\" really means, what makes Japanese and German watches special, and how the three traditions differ.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Swiss watchmaking",
        paragraphs: [
          "Switzerland is home to most of the world's best-known luxury watch brands, from Rolex and Patek Philippe to Audemars Piguet, Omega and many independents. To carry \"Swiss Made\" on the dial, Swiss rules require that the movement is Swiss, the watch is cased and inspected in Switzerland, and at least 60% of the manufacturing costs are incurred in Switzerland.",
        ],
      },
      {
        heading: "Japanese watchmaking",
        paragraphs: [
          "Japan's watch industry is led by Seiko, Citizen and Casio, with Grand Seiko and independent makers like Hajime Asaoka and Kikuchi Nakagawa at the high end. Seiko launched the first quartz wristwatch, the Astron, in 1969. Grand Seiko is admired for its Zaratsu mirror polishing, nature-inspired dials and Spring Drive movement, which gives a perfectly smooth sweeping seconds hand.",
        ],
      },
      {
        heading: "German watchmaking",
        paragraphs: [
          "Germany's fine watchmaking centers on the town of Glashütte in Saxony, home to A. Lange & Söhne, Glashütte Original, Nomos, Moritz Grossmann and others. German watches often feature three-quarter plates, hand-engraved balance cocks and a clean, functional design language. Other German brands, such as Sinn, Damasko and Stowa, are known for robust tool watches and Bauhaus style.",
        ],
      },
      {
        heading: "And beyond",
        paragraphs: [
          "Great watches come from everywhere today: British, French, Danish, American, Australian and Indian brands are thriving, especially among microbrands. Where a watch is made is part of its story, but the best watch for you is the one whose design and quality speak to you.",
        ],
      },
    ],
    related: [
      { label: "What is an independent watchmaker?", href: "/learn/what-is-an-independent-watchmaker" },
      { label: "Browse watch brands in the forum", href: "/forum?subject=brands" },
    ],
  },
  {
    slug: "what-is-an-independent-watchmaker",
    title: "What Is an Independent Watchmaker?",
    category: "Watch Types",
    description: "Independent watchmakers explained: who they are, why their watches are so sought after, and names every collector should know.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Independent, explained",
        paragraphs: [
          "Independent watchmakers are brands that aren't owned by large luxury groups. Many are led by a single master watchmaker and a small team, making a few dozen to a few thousand watches a year, often with extraordinary hand finishing and original movements.",
        ],
      },
      {
        heading: "Why collectors love them",
        bullets: [
          "Hand-finished movements and dials you can study for hours",
          "Original ideas, from unusual complications to new ways of reading the time",
          "Tiny production, so owning one feels personal",
          "A direct connection to the person who made the watch",
        ],
        paragraphs: [],
      },
      {
        heading: "Names to know",
        bullets: [
          "F.P. Journe: famous for the Chronomètre Bleu and Octa collections",
          "Philippe Dufour: the Simplicity is a legend of hand finishing",
          "Kari Voutilainen: Finnish master known for exquisite dials and movements",
          "De Bethune: futuristic designs and technical innovation",
          "MB&F: three-dimensional \"horological machines\"",
          "H. Moser & Cie.: minimalist fumé dials and serious watchmaking",
          "Akrivia / Rexhep Rexhepi, Simon Brette, Naoya Hida and Sylvain Pinaud: some of today's most sought-after names",
        ],
        paragraphs: [],
      },
      {
        heading: "Independents at every price",
        paragraphs: [
          "Independent doesn't always mean expensive. Microbrands are independent too, and many offer original design and great quality for a few hundred dollars. That range, from small makers to master watchmakers, is what Brandon's Brands celebrates.",
        ],
      },
    ],
    related: [
      { label: "Microbrand watches: a beginner's guide", href: "/learn/microbrand-watches-guide" },
      { label: "Why microbrands matter", href: "/about" },
    ],
  },
  {
    slug: "gmt-vs-world-timer-travel-watches",
    title: "GMT vs World Timer: Watches for Travelers",
    category: "Watch Types",
    description: "How GMT, dual-time and world-time watches work, the difference between a \"flyer\" and a \"caller\" GMT, and which suits how you travel.",
    minutes: 4,
    updated: "2026-10-09",
    sections: [
      {
        heading: "GMT watches",
        paragraphs: [
          "A GMT watch adds a fourth hand that goes around the dial once every 24 hours, read against a 24-hour bezel or scale. Set it to home time and you can read two time zones at a glance; turn the bezel and you can track a third. The Rolex GMT-Master was developed in the 1950s for airline pilots.",
        ],
      },
      {
        heading: "\"Flyer\" vs \"caller\" GMTs",
        paragraphs: [
          "On a \"flyer\" or \"true\" GMT, the local hour hand jumps independently, so when you land you can change local time (and the date) without stopping the watch. On a \"caller\" or \"office\" GMT, the 24-hour hand is set independently instead, which suits people who stay home but keep track of colleagues abroad. Flyer GMTs are usually more expensive.",
        ],
      },
      {
        heading: "World timers",
        paragraphs: [
          "A world timer shows the time in all 24 major time zones at once, using a ring of city names and a rotating 24-hour ring. They're beautiful, especially with map dials, and ideal for people who work across many countries.",
        ],
      },
      {
        heading: "Which is right for you?",
        bullets: [
          "Frequent flyer: a flyer GMT",
          "Working with one other time zone from home: a caller GMT or dual-time watch",
          "Calling the whole world: a world timer",
        ],
        paragraphs: [],
      },
    ],
    related: [
      { label: "Types of watches explained", href: "/learn/types-of-watches-explained" },
      { label: "Watch complications explained", href: "/learn/watch-complications-explained" },
    ],
  },
  {
    slug: "how-to-start-a-watch-collection",
    title: "How to Start a Watch Collection",
    category: "Collecting & Community",
    description: "Building a watch collection with purpose: the three-watch collection, setting goals, buying slowly and keeping track of what you own.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Start with a theme or a need",
        paragraphs: [
          "Some collectors chase a brand, a decade, a complication or a color. Others build around how they live. Either way, a little focus helps every new watch earn its place instead of sitting in a drawer.",
        ],
      },
      {
        heading: "The three-watch collection",
        paragraphs: ["A classic way to start is one watch for each part of life:"],
        bullets: [
          "A sports or dive watch for everyday wear, travel and water",
          "A dress watch for weddings, interviews and evenings",
          "A fun or tough watch: a G-Shock, a field watch or a colorful microbrand",
        ],
      },
      {
        heading: "Buy slowly, learn constantly",
        bullets: [
          "Try watches on before you buy and give yourself time to be sure",
          "Read, watch reviews and ask other collectors",
          "Buy the best example you can afford rather than several compromises",
          "Don't be afraid to sell or trade watches that don't get worn",
        ],
        paragraphs: [],
      },
      {
        heading: "Keep track of it",
        paragraphs: [
          "A free account on Brandon's Brands lets you build your collection with photos, references, box & papers and service history, see estimated values updated daily, keep a wishlist with price alerts, and share your collection publicly if you'd like other collectors to see it.",
        ],
      },
    ],
    related: [
      { label: "Best watches under $500, $1,000 and $5,000", href: "/learn/best-watches-by-budget" },
      { label: "Browse public collections", href: "/collectors" },
    ],
  },
  {
    slug: "watch-shows-meetups-and-clubs",
    title: "Watch Shows, Meetups and Clubs: Where to Meet Collectors",
    category: "Collecting & Community",
    description: "The biggest watch fairs, local meetups and online events, and how to find or start a watch club near you.",
    minutes: 4,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Why meet in person",
        paragraphs: [
          "Photos never fully capture a watch. Trying watches on, talking to makers and trading stories with other collectors is one of the best parts of the hobby.",
        ],
      },
      {
        heading: "Big watch fairs",
        bullets: [
          "Watches and Wonders Geneva: the industry's largest annual fair, where many major brands launch new models each spring",
          "Geneva Watch Days: held in late summer, with many brands presenting new releases",
          "Windup Watch Fair: a traveling U.S. show focused on microbrands and independents, run by Worn & Wound",
          "Brand boutiques and retailers often host launch events, so ask to join their mailing lists",
        ],
        paragraphs: [],
      },
      {
        heading: "Local meetups and clubs",
        paragraphs: [
          "Many cities have watch clubs and regular meetups, from casual coffee-and-watches mornings to dinners where everyone brings their favorites. Groups like RedBar have chapters around the world, and local retailers often know what's happening nearby.",
          "Can't find one? Start one: pick a coffee shop, post the date in the forum, and invite a few collectors.",
        ],
      },
      {
        heading: "Online events",
        paragraphs: [
          "Live streams, Instagram Lives, virtual launches and video meetups make it easy to connect from anywhere. Share and find them in the Virtual Events folder of the forum, and follow Brandon for founder interviews and event coverage.",
        ],
      },
    ],
    related: [
      { label: "Watch Clubs & Meetups in the forum", href: "/forum?subject=clubs" },
      { label: "Virtual Events in the forum", href: "/forum?subject=clubs/virtual-events" },
    ],
  },
  {
    slug: "watch-trends-2026",
    title: "Watch Trends 2026: What Collectors Are Buying Now",
    category: "Collecting & Community",
    description:
      "Independent brands, green dials, moon phases, rectangular cases and pre-owned buying: the watch trends collectors care about in 2026, backed by market data.",
    minutes: 5,
    updated: "2026-10-09",
    sections: [
      {
        heading: "From hype to collecting",
        paragraphs: [
          "After a few years of waitlists and fast-rising prices, the market has settled. Chrono24, the largest online watch marketplace, described 2025 as a shift toward a more collector-oriented market: people buying watches they love to wear, rather than chasing whatever might resell for more.",
          "That shift shows up in what people search for and buy. Unusual designs, smaller makers and character are winning attention over simply owning the most famous name.",
        ],
      },
      {
        heading: "Designs gaining ground",
        paragraphs: ["Chrono24's 2025 marketplace data showed clear winners among design details:"],
        bullets: [
          "Moon phase watches: up about 15% in share of demand",
          "Green dials: up about 9.5%",
          "Rectangular cases: up about 9%",
          "Champagne and gold dials: up roughly 7–8%",
          "Classic blue and black dials: flat",
        ],
      },
      {
        heading: "Brands gaining attention",
        paragraphs: [
          "On the same marketplace, IWC (helped by strong interest in the Ingenieur), Vacheron Constantin, Tudor and Cartier all grew their share of demand in 2025. Rolex remained the most traded brand by far, but its share eased slightly as buyers explored more widely.",
          "Industry executives surveyed by Deloitte named independent watchmakers as the next big trend, and younger buyers say affordability, uniqueness and sustainability matter most to them.",
        ],
      },
      {
        heading: "Pre-owned keeps growing",
        paragraphs: [
          "Around 40% of Gen Z and Millennial watch buyers say they are likely to buy pre-owned, according to Deloitte. Pre-owned lets you find discontinued models, try more brands and often get more watch for your budget, as long as you buy carefully.",
        ],
      },
      {
        heading: "What this means for your collection",
        paragraphs: [
          "Trends are fun to follow, but the best watch is still the one you will actually wear. Use trends for ideas, then add the watches you like to your wishlist with a target price so you hear about good deals.",
        ],
      },
    ],
    related: [
      { label: "Green dial watches guide", href: "/learn/green-dial-watches-guide" },
      { label: "Moon phase watches explained", href: "/learn/moon-phase-watches-explained" },
      { label: "Microbrand watches guide", href: "/learn/microbrand-watches-guide" },
      { label: "Buying pre-owned safely", href: "/learn/buying-pre-owned-watches-safely" },
      { label: "Start your wishlist", href: "/wishlist" },
    ],
  },
  {
    slug: "green-dial-watches-guide",
    title: "Green Dial Watches: Why Collectors Love Them and How to Choose One",
    category: "Buying Guides",
    description:
      "Green dials went from rare to one of the most popular watch colors. Here's why, the shades to know, and how to pick a green dial watch you'll love.",
    minutes: 4,
    updated: "2026-10-09",
    sections: [
      {
        heading: "Why green took off",
        paragraphs: [
          "For decades most watches came in black, white, silver or blue. Green was a statement. Rolex helped change that with the green-bezel Submariner in 2003 (nicknamed the \"Kermit\") and the all-green \"Hulk\" in 2010, and today almost every brand, from Swiss icons to small microbrands, offers a green option.",
          "Green is also one of the colors gaining the most ground: Chrono24's 2025 data shows green dials up about 9.5% in share of demand, while classic blue and black stayed flat.",
        ],
      },
      {
        heading: "Shades to know",
        bullets: [
          "Forest and olive green: earthy and easy to wear, great on field and dive watches",
          "Emerald and sunburst green: brighter, and the dial changes with the light",
          "Mint and pistachio: light, playful pastels popular on sporty and casual watches",
          "Fumé (smoked) green: darker toward the edges for a vintage, dressy look",
          "Malachite and stone dials: natural green stone, each one unique",
        ],
        paragraphs: [],
      },
      {
        heading: "How to choose",
        paragraphs: [
          "See the dial in daylight if you can: green can look very different indoors and outdoors. Think about what you'll wear it with: olive and forest work with almost everything, while bright greens make more of a statement. Match the style to your life too: a green diver for weekends, a green dress watch for the office.",
          "Many microbrands offer green dials at friendly prices, so it's an easy way to try the color before committing to a bigger purchase.",
        ],
      },
    ],
    related: [
      { label: "Watch trends 2026", href: "/learn/watch-trends-2026" },
      { label: "Microbrand watches guide", href: "/learn/microbrand-watches-guide" },
      { label: "Best watches by budget", href: "/learn/best-watches-by-budget" },
      { label: "Brandon's Favorites", href: "/favorites" },
    ],
  },
  {
    slug: "moon-phase-watches-explained",
    title: "Moon Phase Watches Explained: How They Work and Why They're Trending",
    category: "How Watches Work",
    description:
      "How a moon phase complication tracks the lunar cycle, how accurate it is, how to set it, and why moon phase watches are one of 2026's fastest-growing trends.",
    minutes: 4,
    updated: "2026-10-09",
    sections: [
      {
        heading: "What a moon phase shows",
        paragraphs: [
          "A moon phase display shows the current shape of the moon in the sky, from new moon to full moon and back. A small disc painted with two moons turns slowly behind a window in the dial, so the moon appears to grow and shrink just like the real one.",
          "It's one of the oldest and most romantic complications in watchmaking, and demand is rising: Chrono24 saw moon phase watches grow about 15% in share of demand in 2025.",
        ],
      },
      {
        heading: "How accurate is it?",
        paragraphs: [
          "The real lunar cycle lasts about 29.5 days. Most moon phase watches use a 59-tooth wheel that moves one tooth a day, covering two lunar cycles. That's very close, but it drifts by about a day every two and a half to three years.",
          "High-precision versions use extra gearing and can stay accurate for over a hundred years before needing a one-day correction.",
        ],
      },
      {
        heading: "Setting your moon phase",
        bullets: [
          "Look up the date of the most recent full moon",
          "Use the pusher or crown position for the moon phase to advance the disc until the moon is centered (full)",
          "Then advance one step for each day since that full moon",
          "Check your watch's manual: many say not to adjust the moon phase or date during certain evening and night hours",
        ],
        paragraphs: [],
      },
    ],
    related: [
      { label: "Watch complications explained", href: "/learn/watch-complications-explained" },
      { label: "How to set and wind your watch", href: "/learn/how-to-set-and-wind-your-watch" },
      { label: "Watch trends 2026", href: "/learn/watch-trends-2026" },
    ],
  },
  {
    slug: "rectangular-watches-guide",
    title: "Rectangular and Tank-Style Watches: A Guide to the Classic Shape",
    category: "Watch Types",
    description:
      "From the Cartier Tank to the Jaeger-LeCoultre Reverso, the story of rectangular watches, why they're back in style, and how to wear one.",
    minutes: 4,
    updated: "2026-10-09",
    sections: [
      {
        heading: "A shape with history",
        paragraphs: [
          "The Cartier Tank, designed in 1917, took its shape from the tanks of World War I and became one of the most copied watch designs ever. In 1931 Jaeger-LeCoultre introduced the Reverso, whose case flips over to protect the crystal, originally for polo players.",
          "Rectangular watches have been a mark of quiet style ever since, worn by artists, actors and anyone who wanted something different from a round watch.",
        ],
      },
      {
        heading: "Why they're back",
        paragraphs: [
          "As collectors move toward smaller, more wearable watches with character, rectangular cases are having a moment. Chrono24's 2025 data shows rectangular watches up about 9% in share of demand, and many brands, including microbrands, have added tank-style models.",
        ],
      },
      {
        heading: "How to choose and wear one",
        bullets: [
          "Size: rectangular watches wear differently from round ones; measure lug to lug and try it on if you can",
          "Strap: leather is classic, but a rectangular watch on a bracelet or colorful strap looks modern",
          "Movement: quartz keeps thin cases light and easy; manual-wind adds tradition",
          "Style: they pair naturally with a shirt cuff and suit just as well with jeans",
        ],
        paragraphs: [],
      },
    ],
    related: [
      { label: "Choosing the right watch size", href: "/learn/choosing-the-right-watch-size" },
      { label: "Iconic watches that shaped history", href: "/learn/iconic-watches-that-shaped-history" },
      { label: "Watch trends 2026", href: "/learn/watch-trends-2026" },
    ],
  },
];

export function getGuide(slug: string): LearnGuide | undefined {
  return learnGuides.find((g) => g.slug === slug);
}
