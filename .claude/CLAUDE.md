# samparadise.com — maintenance notes

Sam's personal site. Repo: `samparadise/pages` on GitHub (public), served by GitHub Pages at
samparadise.com (the `CNAME` file sets the domain). Clone on the Mac mini: `~/code/samparadise.com`.
Sam also edits by hand in his own clone on another machine, so **always `git pull` before editing**.

This file lives in `.claude/` on purpose: GitHub Pages runs Jekyll, which publishes every file in
the repo *except* ones whose name starts with `.` or `_`. A `CLAUDE.md` or `README.md` at the root
would be live at samparadise.com/CLAUDE.md. Keep notes and drafts in dot- or underscore-folders.

## How the site is built

Plain HTML, CSS and JavaScript. No build step, no Jekyll templates or front matter, no layouts:
every page is a complete HTML file, and what's in the repo is exactly what's served.

- `index.html` + `script.js` + `styles.css`: the homepage. `script.js` fills it from JSON:
  - `menu.json`: the navbar dropdowns (PondCast, Writing, Software). An entry with `"link"`
    goes straight to a page; one with `"overview_md"` opens a markdown side panel.
  - `quotes.json`: the rotating homepage quote. `images.json`: the Photography gallery
    (files in `photos/`). `lists.json`: a Lists page that's currently commented out.
- `stuff/` (+ `stuff.json`): Amazon picks. `blog/`: blog posts. `cards/`, `messages/`, `cal/`:
  standalone pages. `files/`: downloads. `videos/`: video files.
- `img/`: icons, post images, menu thumbnails. `photos/`: gallery photos only.
- Shared look: Bootstrap 5.3.2 and Google Fonts from CDNs, then `/styles.css`. Blog styles are
  the `.blog-*` rules near the end of `styles.css`.

## Add a blog post

1. Copy the newest post: `cp blog/sal.html blog/<slug>.html`. The filename is the URL:
   `blog/<slug>.html` → samparadise.com/blog/<slug>.html.
2. Change `<title>`, `.blog-meta` (month and year), `.blog-title`, the intro paragraphs, the
   hero image, and the body. Keep the `<head>`, navbar and closing Bootstrap script as they are.
   Use root-relative paths (`/styles.css`, `/img/...`) so they work from inside `blog/`.
3. Building blocks available in `styles.css` (copy the markup from `blog/sal.html`):
   - `.blog-subtitle`, `.blog-intro`: the lead-in paragraphs; `.blog-hero-img`: the big image
   - `.blog-divider`, then `<div class="blog-body">` with `h2`, `h3`, `p`, `ul`/`ol`,
     `blockquote`, `code`
   - `.blog-epigraph`: the short line under an `h2` (CSS makes it uppercase; type it normally)
   - `.blog-recipe` with two `.blog-recipe-col`s and `.recipe-num` / `.recipe-num-plain` badges
   - `dl.blog-terms` (`dt`/`dd` pairs) for glossaries; `.blog-dialog` with `.blog-dialog-prompt`
     and `.blog-dialog-response` for a chat exchange
   - Not styled yet: `pre` and `table`. Add CSS before using them.
4. List it on the homepage: the "Writing" dropdown in `menu.json` is the blog index. Add an entry
   like `{"item": "Title", "image": "img/thumb.png", "link": "/blog/<slug>.html"}`. Keep the
   JSON valid (commas!): `python3 -m json.tool menu.json > /dev/null` checks it.
5. Check it locally (below) on desktop and at phone width.

## Add images

- Post and menu images go in `img/`, referenced as `/img/name.png`. Gallery photos go in
  `photos/` plus an entry in `images.json` (`filename`, `description`).
- Use lowercase-hyphenated names, and keep them small: resize to ~1600px wide and compress
  before committing (`sips -Z 1600 file.jpg`). The repo is already ~40 MB, mostly `videos/`.
- Everything in the repo is public, including old or unlinked files. Strip location data from
  phone photos: in Photos, export with "Location Information" unchecked (or share with
  Options → Location off).

## Preview locally

```bash
cd ~/code/samparadise.com && python3 -m http.server 8000
```

Then open http://localhost:8000. Use the server, not the file directly: the homepage loads
its JSON with `fetch`, which doesn't work from `file://`.

## Publish

GitHub Pages deploys from the `main` branch, repo root. Pushing to `main` is publishing:

```bash
git pull
git add blog/<slug>.html img/<image>.png menu.json   # name the files; never `git add -A`
git commit -m "Blog: <title>"
git push
```

The site updates within a minute or two (watch the repo's Actions tab if it doesn't). Pages and
browsers cache for about 10 minutes, so hard-refresh. To undo a publish: `git revert <sha>` and push.

## Rules

- Commit only the files you meant to change. Never commit secrets (API keys, tokens, `.env`).
- Keep private family details off the site: kids' names, school, custody, addresses, family
  emails. Sam's own public contact card is intentional.
- Claude asks Sam before pushing.
