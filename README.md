# Apparate website

Two-page website for **apparate.net**, with a content editor at `/admin` and SEO, GEO and AEO built in.

| Page | Address |
|---|---|
| Home (story, services, process, quality, portfolio, FAQ) | `/` |
| Let's build a long-term partnership (feasibility brief) | `/start/` |
| Content editor | `/admin/` |

Built with [Eleventy](https://www.11ty.dev/) (static site generator) and [Decap CMS](https://decapcms.org/) (free, open-source editor). The site is plain HTML at the end: fast, cheap to host, and easy for Google and AI assistants to read.

---

## 0. Test on GitHub first (before going live)

The project includes a ready workflow (`.github/workflows/test-site.yml`) that publishes a **test copy** on GitHub Pages every time something changes. The test copy is hidden from Google and AI crawlers, so it never competes with apparate.net.

1. Create a repository on github.com (for example `apparate-website`). On a free GitHub plan, GitHub Pages needs the repository to be **Public**. A private repository needs GitHub Pro/Team.
2. Upload this project to it (see below).
3. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab and wait for "Test site (GitHub Pages)" to turn green (about 1–2 minutes).
5. The test site is at `https://<your-github-user>.github.io/apparate-website/`. Share that link and the repository with the development team.

On the test copy the content editor (`/admin`) does not work. It starts working once the site is on Netlify (section 1).

**Uploading without any tools:** on the empty repository page click *uploading an existing file*, then drag in the **contents** of the `apparate-website` folder, including the hidden `.github` folder. Do not include `node_modules` or `_site`. On Mac press Cmd + Shift + . in Finder to show hidden folders. GitHub's web upload takes up to 100 files at a time, so upload `src/assets/img` in a second batch if needed.

**With Git (developers):**
```bash
git init && git add . && git commit -m "Apparate website"
git branch -M main
git remote add origin https://github.com/<your-github-user>/apparate-website.git
git push -u origin main
```

## 1. One-time setup (for a developer, about 30–45 minutes)

1. **Put the project on GitHub.** Create a private repository (for example `apparate/website`) and push this folder to the `main` branch.
2. **Connect it to Netlify** (free plan is enough): *Add new site → Import from GitHub →* pick the repo. Netlify reads `netlify.toml`, so the build command (`npm run build`) and publish folder (`_site`) are already set.
3. **Point the domain.** In Netlify: *Domain management → Add domain → apparate.net*, then update the DNS records at your domain registrar as Netlify shows. HTTPS is switched on automatically.
4. **Turn on the editor login.** In Netlify: *Project configuration → Identity → Enable Identity*, set *Registration* to **Invite only**, then under *Services* enable **Git Gateway**.
5. **Invite the team.** *Identity → Invite users →* enter each editor's email. They get an email, set a password, and can then sign in at `https://apparate.net/admin/`.

> If Netlify Identity is not available on your Netlify account, change the first lines of `src/admin/config.yml` to
> `backend: { name: github, repo: apparate/website, branch: main }` and give each editor a free GitHub account with access to the repository. Nothing else changes.

If the website address is not `https://apparate.net`, change it once in the editor under **Site settings → Website address** (it feeds Google, the sitemap and social previews).

## 2. Editing content (for the Apparate team)

1. Go to `https://apparate.net/admin/` and sign in.
2. Pick what to edit:
   - **⚙️ Site settings & contact**: company details, phone, WhatsApp, email, address, top menu, footer.
   - **📄 Pages → Home page**: every section of the home page, numbered in the order they appear (opening, numbers, story, accountability gap, purpose, values … FAQ).
   - **📄 Pages → Start a feasibility review page**: the standalone partnership page and all form labels and options.
   - **👕 Portfolio**: product categories and products. Add a product with **Add products**, upload photos (the first photo is the cover), pick the category.
3. Change text or upload a new photo, then press **Publish**. The live site updates in about a minute.

Tips:
- **Photos**: use landscape JPG/WebP around 1600 px wide for backgrounds and 1000 px for products. Always fill in the *photo description* field; Google and screen readers use it.
- **Handwritten words** (the Belantica script) are separate fields named *Handwritten word*, so the style stays consistent.
- **Undo**: every save is kept in GitHub history, so a developer can restore any earlier version.

## 3. SEO, GEO and AEO: what is already done

**SEO (Google, Bing)**
- Unique page titles and meta descriptions per page, editable in the editor (*🔎 Google & social preview*).
- Canonical links, `robots` meta, language and region tags (`en`, Egypt / New Cairo).
- Open Graph and Twitter cards, so links shared on WhatsApp, LinkedIn and Facebook show the right image and text.
- `sitemap.xml` (including portfolio images) and `robots.txt`.
- One `<h1>` per page, ordered headings, descriptive image alt text, fast static pages, lazy-loaded images, a 404 page.

**Structured data (schema.org JSON-LD)**: tells search engines exactly who Apparate is:
- `Organization` + `LocalBusiness`: name, logo, founding year, New Cairo address, phone, email, WhatsApp, countries served, expertise.
- `OfferCatalog` of services: manufacturing, quality assurance, printing, embroidery, sourcing.
- `FAQPage` on the home page, `ContactPage` + `BreadcrumbList` on the start page, `WebSite` and `WebPage` on both.

**GEO (Generative Engine Optimization: ChatGPT, Claude, Perplexity, Gemini, Copilot)**
- `robots.txt` explicitly allows the main AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended…).
- `/llms.txt`: a plain-language fact sheet about Apparate (capacity, MOQ, timelines, AQL levels, techniques, brands, contact, FAQ). It is generated from the same content the team edits, so it never goes out of date.
- Facts are written as clear, quotable sentences with real numbers (50+ factories, 50,000 pieces/month, MOQ 100, AQL 2.5/4.0).

**AEO (Answer Engine Optimization: featured snippets, voice and AI answers)**
- A visible **FAQ section** with nine real buyer questions, each answered directly in the first sentence, marked up as `FAQPage`. Edit or add questions in *Home page → 21 · FAQ*.

## 4. After launch (recommended, 1–2 hours)

1. **Google Search Console**: add `apparate.net`, verify it, and submit `https://apparate.net/sitemap.xml`.
2. **Bing Webmaster Tools**: import from Search Console (Bing also feeds ChatGPT and Copilot search).
3. **Google Business Profile**: create or claim "Apparate" in New Cairo with the same name, phone and website. This drives local searches like "clothing manufacturer Egypt".
4. **Social profiles**: add LinkedIn, Instagram and Facebook links in *Site settings → Social profile links*; they are added to the structured data as `sameAs`.
5. **Check** the structured data at <https://search.google.com/test/rich-results> and the share preview at <https://www.linkedin.com/post-inspector/>.
6. **Keep it fresh**: add new portfolio pieces and FAQ answers as real questions come in. Consider an Arabic version later for local search.

## 5. Running it on a computer (developers)

```bash
npm install
npm start          # local preview at http://localhost:8080 (editor content is read from src/_data)
npm run build      # production build into _site/
```

Project map:

```
src/_data/          content files edited from /admin (site.json, home.json, start.json, portfolio.json)
src/_includes/      layout (base.njk), SEO tags & structured data (seo.njk), icons
src/index.njk       home page          src/start.njk   standalone partnership page
src/assets/         css, js, fonts (Belantica), images
src/admin/          Decap CMS editor + field configuration (config.yml)
src/sitemap.njk, robots.njk, llms.njk, 404.njk
netlify.toml        build, redirects, caching headers
```

**Brief form:** visitors send their brief through WhatsApp or email. Uploaded idea files stay on the visitor's device, and the brief asks them to attach the files to that message. To receive files and briefs directly, connect a form service later (for example Netlify Forms) to the start page.
