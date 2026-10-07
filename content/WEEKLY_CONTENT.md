# Weekly blog + social drafts

Every Monday morning a scheduled Claude run drafts the week's blog post and the
matching social posts. Nothing goes live until someone approves it by merging the
pull request (PR). Vercel builds a preview link for every PR, so the post can be
read exactly as it will appear before it's published.

## The weekly run

1. Pick the first `planned` row in `content/blog-calendar.md`.
2. Research the watch/topic on the web: brand pages, specs, list price, and for
   founder interviews the brand's story. Facts must come from pages actually read;
   never invent quotes, prices or specs. Brandon's own opinions are not invented:
   where the post needs his take, leave a clearly marked `[BRANDON: ...]` prompt.
3. Add the post to the TOP of the `blogPosts` array in `src/lib/blogPosts.ts`
   (newest first), dated the calendar's Thursday.
4. Write `content/drafts/<publish-date>-<slug>.md` with the social posts (below).
5. Update the calendar row's status to `drafted (PR #n)`.
6. Check it builds (`npx tsc --noEmit`), open a PR titled
   `Blog draft for <date>: <title>`, and email the PR link, the Vercel preview link
   and the social posts to the owner for approval.

## Blog post format

- 400–700 words, 3–6 short sections' worth of paragraphs (the `body` array holds
  one string per paragraph; no markdown inside strings).
- Title names the watch. The first paragraph answers "is this watch worth it?" or
  says what the reader will get.
- Voice: Brandon — a young, enthusiastic New Jersey watch collector who founded
  The Watch Collective of NJ. Friendly, plain, curious; not salesy; no hype words
  like "game-changer". Prices in USD, rounded ("about $4,400").
- End with a line pointing to the reel on Instagram (@brandonsbrands17) and the
  collab email collab@brandonsbrands17.com when it fits.
- `category` = the calendar's Format. `excerpt` = one sentence, under 160 characters.

## Social posts (in the draft .md file)

Repurpose the post for each platform; Brandon films/edits the video himself.

- **Instagram** — reel caption: hook line, 2–3 short lines, call to action
  ("Full review on the blog — link in bio"), tag the brand's handle, 5–8 hashtags
  (#watchfam #watchcollector #watchesofinstagram + brand tags).
- **TikTok** — one punchy on-screen text hook for the first second + a caption
  under 150 characters + 3–5 hashtags.
- **YouTube Shorts** — title under 70 characters + a 2-line description with the
  blog link.
- **Facebook** — 2–3 sentence post sharing the blog link.
- **Reel idea** — a 15–30 second shot list if no reel exists yet.

Blog link format: https://brandonsbrands17.com/blog/<slug>
