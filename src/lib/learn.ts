// Education ("Learn") guides: buying guides, watch types, how watches work and watch history.
//
// To add a guide: copy one of the objects below, give it a unique slug (lowercase-with-dashes),
// pick a category, and write the sections. Each section has a heading and paragraphs; bullets are optional.

export type LearnCategory = "Buying Guides" | "Watch Types" | "How Watches Work" | "Watch History";

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
        heading: "Why it matters to us",
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
];

export function getGuide(slug: string): LearnGuide | undefined {
  return learnGuides.find((g) => g.slug === slug);
}
