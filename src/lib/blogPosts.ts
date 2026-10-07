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
