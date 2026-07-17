---
name: kindle
description: "kindle"
---

---
name: kindle-ebook
description: Use this skill whenever the user asks to create an e-book, ebook, "livro para Kindle", KDP book, or any long-form .docx book/guide meant for Amazon Kindle Direct Publishing — even if they don't mention "Kindle" or "Look Inside" explicitly (e.g. "crie um e-book sobre X", "faça um livro digital sobre Y", "monte um guia em docx para vender"). Always apply the Amazon "Look Inside" / free-sample optimization rules from this skill so front matter doesn't waste the free preview, always build an elegant styled .docx (colors, section themes, decorative cards) instead of a plain document, and always offer to generate a matching persuasive cover at the correct KDP pixel dimensions. Do not wait for the user to ask for a cover or for "Look Inside" — proactively apply both.
---

# Kindle Ebook Creator

This skill packages everything learned from building Portuguese-language Kindle e-books: how to write and structure the manuscript so Amazon's free preview ("Look Inside" / "Enviar amostra") actually sells the book, how to build an elegant, colorful `.docx` instead of a plain Word doc, and how to generate a persuasive cover at the exact KDP pixel size.

Always apply this skill's rules automatically for ebook requests — don't wait for the user to ask specifically about "Look Inside," colors, or a cover.

## 1. The "Look Inside" rule (most important, and most often skipped)

Amazon's "Look Inside" on the product page, and the "send free sample" button on Kindle, both give readers roughly the **first ~10% of the book for free**, front matter included. That 10% is the single biggest sales lever the book has — if it's burned on decorative filler, the sample ends before the reader ever sees the good content.

Apply these rules to every ebook built:

1. **Minimize front matter.** One cover page + one short TOC is enough. Do NOT add a separate half-title page, dedication page, or multi-page copyright/legal boilerplate unless the user asks for one. Every extra front-matter page pushes real content further past the sample cutoff.
2. **Put a hook before the outline.** Immediately after the TOC (or even before it), include a short, punchy paragraph or two that creates curiosity or promises a specific payoff — not a generic "this book will cover..." intro. This is what the free sample needs to convert a browser into a buyer.
3. **Front-load the best material.** Within the first section/chapter, lead with the single most surprising or compelling item, not the driest or most chronological one. Assume only the first section will be read for free — it must stand alone as a reason to buy.
4. **Estimate the cutoff and tell the user.** After generating the manuscript, roughly compute: `sample_pages ≈ total_pages * 0.10`. Tell the user in plain terms what a reader will and won't see for free (e.g. "amostra grátis cobre até aproximadamente a página X, ou seja, o leitor verá a introdução e as primeiras N curiosidades da Parte I antes do corte"). This lets the user judge if the hook lands before the cutoff.
5. **Never put essential payoff only after the estimated cutoff.** If the book's single strongest content is in Part 3, consider moving a teaser/preview of it earlier, or explicitly flag this tradeoff to the user.

## 2. Building the elegant .docx manuscript

Always read `/mnt/skills/public/docx/SKILL.md` first for the baseline mechanics of docx generation. On top of that baseline, apply this skill's house style, validated in past builds:

- **Use the `docx` npm package directly** (not just python-docx) when you need per-paragraph background shading and colored left-borders — this is what makes the doc look like a designed book instead of a Word default.
- **Structure**: Cover page → short TOC → hook/intro (see Look Inside rules above) → N thematic parts, each with its own accent color → conclusion.
- **Give each part its own color theme** (an accent color + a light shade color), e.g.:
  - Part I: accent `9C6B30` (gold/brown), shade `F6ECD9`
  - Part II: accent `1F4E79` (blue), shade `DCE6F1`
  - Part III: accent `7A2048` (wine), shade `F3DEE7`
  Reuse this exact 3-theme palette by default unless the topic calls for different colors (e.g. a tech book might want blue/teal/graphite instead of gold/blue/wine).
- **Section title pages**: centered kicker label (small caps, accent color) + big subtitle + short italic intro paragraph, on a shaded background, own page.
- **Content items as "cards"**: each list item / curiosity / tip gets its own paragraph block with a colored left border (`BorderStyle.SINGLE`, size ~24, accent color) and a light background shade matching its part, bold colored title line + normal body text. This is the single biggest visual upgrade over a plain docx — always do this for listicle-style ebooks (curiosities, tips, facts, etc.).
- **Fonts**: default to a serif font (`Georgia` if available at render time, otherwise let LibreOffice substitute) for a "book" feel, not a sans default.
- **Page size**: use Kindle trim size in DXA units for the docx page: width `8640`, height `12960` (6in × 9in), margins ~1000-1100 DXA.
- Reference `scripts/build_docx_template.js` in this skill for a full working example (structure, helper functions for cover/TOC/section pages/cards) — adapt the `data.js`-style content object rather than rewriting the builder from scratch.
- **Always render a few pages to JPEG via LibreOffice + pdftoppm and view them before delivering**, exactly as the docx skill instructs — colored/shaded design is easy to get subtly wrong (contrast, spacing) and must be visually checked.

## 3. Building the persuasive Kindle cover

Amazon KDP's recommended cover size is **1600 × 2560 px** (portrait, ratio 1:1.6; absolute minimum 625×1000). Always generate the cover at 1600×2560 unless the user asks otherwise.

Process (validated approach — no browser/headless-chrome needed):

1. Build the artwork as SVG (full control over gradients, text, decorative elements), then rasterize with `rsvg-convert` (install via `apt-get install -y librsvg2-bin` if not already present — it's on the allowed network).
2. Use elegant, non-default fonts instead of system sans defaults. This skill bundles:
   - `assets/fonts/Cinzel.ttf` and `CinzelDecorative-Regular.ttf` — for titles/headers (elegant, all-caps friendly serif display face)
   - `assets/fonts/CormorantGaramond.ttf` and `CormorantGaramond-Italic.ttf` — for subtitles/taglines (refined italic serif)
   Copy these into `~/.fonts/` and run `fc-cache -f` before rendering. If the topic doesn't suit a "sacred/classic" look, it's fine to swap in other Google Fonts fetched from `raw.githubusercontent.com/google/fonts/main/ofl/<font>/...` (this domain is allowed).
3. Cover content hierarchy that sells (in this order, top to bottom): small kicker/credibility line → optional emblem/graphic relevant to the topic → big number or bold title → subtitle stating the specific promise/benefit → a short persuasive hook line in a ribbon/banner (a curiosity-gap or benefit statement, not a repeat of the title) → decorative close.
4. Add depth: gradient background, a soft radial glow, a subtle vignette, and an ornamental frame with corner accents — flat single-color backgrounds read as amateur.
5. Reference `scripts/build_cover_template.js` in this skill for a full working generator (rays/halo/frame helpers, gradient defs) — adapt colors and text per topic instead of rewriting from scratch.
6. Render, view the PNG/JPEG at actual size before delivering, and export a final JPEG (`convert cover.png -quality 92 cover.jpg`) since KDP accepts JPEG/TIFF.

## 4. Delivery checklist

Before presenting the final files to the user, confirm:
- [ ] Front matter is minimal (cover + short TOC only)
- [ ] A real hook/teaser appears before the outline, not generic boilerplate
- [ ] Told the user roughly where the ~10% free-sample cutoff falls
- [ ] docx uses a 3-part (or N-part) color theme with shaded card-style content blocks, not plain paragraphs
- [ ] Pages were rendered to image and visually checked
- [ ] Cover is exactly 1600×2560 px (or the size the user requested), uses non-default fonts, has a clear hook line, and was visually checked at final size
- [ ] Both files (.docx manuscript + cover image) are copied to `/mnt/user-data/outputs` and presented together