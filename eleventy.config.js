// Apparate website — Eleventy configuration
// Content lives in src/_data/*.json and is edited from /admin (Decap CMS).
// ARTIFACT=1 builds a preview with relative paths (used for the Claude preview link only).
// PATH_PREFIX=/apparate-website builds for a sub-folder address (GitHub Pages test site).
// TEST_SITE=1 marks the build as a test copy: hidden from Google and AI crawlers.
const ARTIFACT = !!process.env.ARTIFACT;
const PREFIX = (process.env.PATH_PREFIX || "").replace(/\/+$/, "");
const TEST = !!process.env.TEST_SITE;

import fs from "node:fs";
import path from "node:path";

export default function (eleventyConfig) {
  eleventyConfig.addGlobalData("env", { artifact: ARTIFACT, prefix: PREFIX, test: TEST });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.ignores.add("src/admin/**");
  if (!ARTIFACT) eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  else ["src/404.njk", "src/sitemap.njk", "src/robots.njk", "src/llms.njk"].forEach(f => eleventyConfig.ignores.add(f));

  // u: site path -> URL. Production keeps root-relative paths (/assets/..., /start/, /#who).
  // Preview build turns them into paths relative to the root page.
  eleventyConfig.addFilter("u", (p, currentUrl) => {
    if (!p || typeof p !== "string") return p;
    if (/^(https?:|mailto:|tel:|#)/.test(p)) return p;
    if (!ARTIFACT) {
      if (currentUrl === "/" && p.startsWith("/#")) return p.slice(1); // same-page anchor
      return p.startsWith("/") ? PREFIX + p : p;
    }
    if (p === "/") return "./";
    if (p === "/start/") return "start.html";
    if (p.startsWith("/#")) return currentUrl === "/" ? p.slice(1) : "./" + p.slice(1);
    return p.replace(/^\//, "");
  });

  // Test copy on GitHub Pages: the editor signs in with GitHub directly (Sveltia CMS, same config),
  // because Netlify Identity only exists once the site runs on Netlify.
  if (TEST && process.env.GITHUB_REPOSITORY) {
    eleventyConfig.on("eleventy.after", ({ dir }) => {
      const out = path.join(dir.output, "admin");
      fs.mkdirSync(out, { recursive: true });
      let cfg = fs.readFileSync("src/admin/config.yml", "utf8");
      cfg = cfg.replace(/backend:\n(  .*\n)+/, `backend:\n  name: github\n  repo: ${process.env.GITHUB_REPOSITORY}\n  branch: main\n`);
      // brand assets live under the sub-folder address on the test site
      cfg = cfg.replace(/\/assets\/img\/image114\.webp/g, `${PREFIX}/assets/img/logo-mark.png`).replace('logo_url:', 'app_title: Apparate · Content (test)\nlogo_url:');
      fs.writeFileSync(path.join(out, "config.yml"), cfg);
      fs.writeFileSync(path.join(out, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Apparate · Content (test)</title>
<link rel="icon" type="image/png" href="${PREFIX}/assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anta&family=Inter:wght@400;500;600;700&display=swap">
<style>
/* Apparate brand layer for the Sveltia editor (test site) */
:root,:root[data-theme]{--sui-base-hue:325!important;--sui-font-family-default:Inter,system-ui,-apple-system,"Segoe UI",sans-serif!important;
 --sui-primary-accent-color:#E2198B!important;--sui-primary-accent-color-light:#ff4fb0!important;--sui-primary-accent-color-dark:#b0106b!important;
 --sui-primary-accent-color-text:#ff6fbd!important;--sui-primary-accent-color-inverted:#fff!important}
/* deep black surfaces matching the website (#0E0E12) */
html,body{background:#0E0E12!important}
:root[data-theme="dark"]{--sui-background-color-1-hsl:240 12% 6%!important;--sui-background-color-2-hsl:240 10% 8%!important;--sui-background-color-3-hsl:240 8% 10%!important;--sui-background-color-4-hsl:240 6% 14%!important;--sui-background-color-5-hsl:240 5% 26%!important;--sui-border-color-1-hsl:0 0% 45%!important;--sui-border-color-2-hsl:0 0% 26%!important;--sui-border-color-3-hsl:0 0% 21%!important;--sui-foreground-color-1-hsl:0 0% 96%!important;--sui-foreground-color-2-hsl:0 0% 82%!important;--sui-foreground-color-3-hsl:0 0% 68%!important;--sui-foreground-color-4-hsl:0 0% 55%!important;--sui-foreground-color-5-hsl:0 0% 36%!important}
:root[data-theme="light"]{--sui-background-color-1-hsl:0 0% 100%!important;--sui-background-color-2-hsl:0 0% 98%!important;--sui-background-color-3-hsl:0 0% 95%!important;--sui-background-color-4-hsl:0 0% 91%!important;--sui-background-color-5-hsl:0 0% 80%!important;--sui-border-color-1-hsl:0 0% 55%!important;--sui-border-color-2-hsl:0 0% 70%!important;--sui-border-color-3-hsl:0 0% 80%!important;--sui-foreground-color-1-hsl:0 0% 6%!important;--sui-foreground-color-2-hsl:0 0% 20%!important;--sui-foreground-color-3-hsl:0 0% 35%!important;--sui-foreground-color-4-hsl:0 0% 48%!important;--sui-foreground-color-5-hsl:0 0% 62%!important;--sui-primary-accent-color-text:#c0147a!important}
button.primary,[role="button"].primary,.sui.button.primary{background:linear-gradient(90deg,#E2198B,#8A55D6,#0A86FF)!important;border:0!important;color:#fff!important}
</style></head>
<body>
<div id="help" style="position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99999;max-width:min(560px,calc(100% - 32px));background:#fff;color:#1a1a1a;font:14px/1.5 system-ui,sans-serif;padding:14px 18px;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.35);border-top:4px solid #E2198B">
<b>Test editor: how to sign in</b><br>
1. <a href="https://github.com/settings/tokens/new?scopes=repo&amp;description=Apparate%20editor" target="_blank" rel="noopener">Create a GitHub token</a>: keep the ticked <b>repo</b> box, click <b>Generate token</b>, copy it (starts with ghp_).<br>
2. Click <b>Sign In Using Access Token</b> below and paste it. (The "Sign In with GitHub" button only works on the live site.)
<button onclick="this.parentNode.remove()" style="position:absolute;top:6px;right:8px;border:0;background:none;font-size:18px;cursor:pointer" aria-label="Close">×</button>
</div>
<script src="https://unpkg.com/@sveltia/cms@0.221.8/dist/sveltia-cms.js"></script>
<script>(function(){var t=setInterval(function(){var h=document.getElementById('help');if(!h){clearInterval(t);return;}var btns=[].slice.call(document.querySelectorAll('button')).filter(function(b){return !h.contains(b);});var signIn=btns.some(function(b){return /sign in/i.test(b.textContent);});var loaded=btns.length>0;if(loaded&&!signIn){h.remove();clearInterval(t);}},700);})();</script>
</body></html>
`);
    });
  }

  eleventyConfig.addFilter("pad2", n => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("num", (n, plain) => plain ? String(n) : Number(n).toLocaleString("en-US"));
  eleventyConfig.addFilter("maxval", rows => Math.max(...rows.map(r => Number(r.value) || 0)));
  eleventyConfig.addFilter("countCat", (items, id) => items.filter(i => i.category === id).length);
  eleventyConfig.addFilter("isoDate", d => new Date(d || Date.now()).toISOString().slice(0, 10));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: ARTIFACT ? "_preview" : "_site" },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
  };
}
