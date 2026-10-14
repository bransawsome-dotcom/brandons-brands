// Brandon's Brands social accounts — edit here and every link on the site updates.

export type Social = {
  name: string;
  handle: string;
  url: string;
  blurb: string;
};

export const socials: Social[] = [
  {
    name: "Instagram",
    handle: "@brandonsbrands17",
    url: "https://www.instagram.com/brandonsbrands17/",
    blurb: "Reels, wrist shots, unboxings and new-release first looks.",
  },
  {
    name: "TikTok",
    handle: "@brandons.brands",
    url: "https://www.tiktok.com/@brandons.brands",
    blurb: "Quick watch reviews and watch culture in under a minute.",
  },
  {
    name: "YouTube",
    handle: "@BrandonsBrands",
    url: "https://www.youtube.com/@BrandonsBrands",
    blurb: "Longer hands-on looks, reviews and event coverage.",
  },
  {
    name: "Facebook",
    handle: "Brandon's Brands",
    url: "https://www.facebook.com/profile.php?id=61595018145265",
    blurb: "Updates, photos and news from Brandon's Brands.",
  },
];

// The Facebook group Brandon helps run as an admin (created by Jeffrey Thomas). Not Brandon's own account,
// so it's kept out of `socials` (which feeds "sameAs" in structured data).
export const facebookGroup = {
  name: "Luxury Microbrand Watches",
  url: "https://www.facebook.com/groups/419331496032314",
  blurb: "A Facebook group of 6,600+ collectors sharing microbrand and independent watches. Brandon is one of its admins.",
};

export const collabEmail = "collab@brandonsbrands17.com";
