// Apparate website — Eleventy configuration
// Content lives in src/_data/*.json and is edited from /admin (Decap CMS).
// ARTIFACT=1 builds a preview with relative paths (used for the Claude preview link only).
// PATH_PREFIX=/apparate-website builds for a sub-folder address (GitHub Pages test site).
// TEST_SITE=1 marks the build as a test copy: hidden from Google and AI crawlers.
const ARTIFACT = !!process.env.ARTIFACT;
const PREFIX = (process.env.PATH_PREFIX || "").replace(/\/+$/, "");
const TEST = !!process.env.TEST_SITE;

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
