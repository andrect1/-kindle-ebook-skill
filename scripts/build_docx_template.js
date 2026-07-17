/**
 * build_docx_template.js
 *
 * Reusable engine for building styled Kindle/KDP e-books (.docx) following
 * the house style in SKILL.md:
 *   - Kindle trim size (6in x 9in) page
 *   - Cover page + short TOC (minimal front matter, protects "Look Inside")
 *   - Hook/intro paragraph before the outline
 *   - N thematic "parts", each with its own accent + shade color
 *   - Content items rendered as colored "cards" (left border + shaded bg)
 *   - Conclusion page
 *
 * Usage:
 *   node build_docx_template.js path/to/data.js output.docx
 *
 * `data.js` must `module.exports` an object shaped like example/data.js
 * in this folder. Adapt that object per book instead of rewriting this
 * file from scratch.
 */

const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  WidthType,
  PageBreak,
  TableOfContents,
  Header,
  Footer,
  PageNumber,
} = require("docx");

// ---- Kindle trim size (6in x 9in) in DXA (1440 = 1 inch) ----
const PAGE = { width: 8640, height: 12960 };
const MARGIN = 1000;

// ---- Default 3-part palette (gold / blue / wine) ----
const DEFAULT_THEMES = [
  { accent: "9C6B30", shade: "F6ECD9" }, // Part I - gold/brown
  { accent: "1F4E79", shade: "DCE6F1" }, // Part II - blue
  { accent: "7A2048", shade: "F3DEE7" }, // Part III - wine
];

function themeFor(index, themes) {
  return themes[index % themes.length];
}

// ---------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------

function coverPage({ title, subtitle, author }) {
  return [
    new Paragraph({
      spacing: { before: 3000, after: 400 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 64,
          color: "1F1F1F",
          font: "Georgia",
        }),
      ],
    }),
    subtitle
      ? new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
          children: [
            new TextRun({
              text: subtitle,
              italics: true,
              size: 30,
              color: "555555",
              font: "Georgia",
            }),
          ],
        })
      : null,
    author
      ? new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: author, size: 24, color: "888888", font: "Georgia" }),
          ],
        })
      : null,
    new Paragraph({ children: [new PageBreak()] }),
  ].filter(Boolean);
}

function tocPage() {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "Sumário", font: "Georgia" })],
    }),
    new TableOfContents("Sumário", {
      hyperlink: true,
      headingStyleRange: "1-2",
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function hookPage({ hookTitle, hookParagraphs }) {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: hookTitle || "Antes de começar...", font: "Georgia" })],
    }),
    ...hookParagraphs.map(
      (p) =>
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: p, size: 24, font: "Georgia" })],
        })
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// Section/part title page: kicker + big title + short italic intro, on shaded bg
function sectionTitlePage({ kicker, title, intro, theme }) {
  return [
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: theme.shade },
      alignment: AlignmentType.CENTER,
      spacing: { before: 2600, after: 200 },
      children: [
        new TextRun({
          text: (kicker || "").toUpperCase(),
          bold: true,
          size: 20,
          color: theme.accent,
          font: "Georgia",
        }),
      ],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: theme.shade },
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
      children: [new TextRun({ text: title, color: "1F1F1F", font: "Georgia" })],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: theme.shade },
      alignment: AlignmentType.CENTER,
      spacing: { after: 3200 },
      children: [
        new TextRun({ text: intro || "", italics: true, size: 24, color: "444444", font: "Georgia" }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// A single "card": colored left border + light shaded background,
// bold colored title line + normal body text.
function contentCard({ title, body, theme }) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: theme.shade },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: theme.accent, space: 8 },
    },
    spacing: { before: 200, after: 200 },
    indent: { left: 100 },
    children: [
      new TextRun({ text: title, bold: true, color: theme.accent, size: 24, font: "Georgia" }),
      new TextRun({ text: "  —  ", color: theme.accent, size: 24 }),
      new TextRun({ text: body, size: 24, color: "2B2B2B", font: "Georgia" }),
    ],
  });
}

function partSection({ part, index, themes }) {
  const theme = themeFor(index, themes);
  const paragraphs = [
    ...sectionTitlePage({
      kicker: part.kicker || `Parte ${index + 1}`,
      title: part.title,
      intro: part.intro,
      theme,
    }),
  ];

  for (const item of part.items) {
    paragraphs.push(contentCard({ title: item.title, body: item.body, theme }));
  }

  paragraphs.push(new Paragraph({ children: [new PageBreak()] }));
  return paragraphs;
}

function conclusionPage({ title, paragraphs }) {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: title || "Conclusão", font: "Georgia" })],
    }),
    ...(paragraphs || []).map(
      (p) =>
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: p, size: 24, font: "Georgia" })],
        })
    ),
  ];
}

// ---------------------------------------------------------------------
// Main build
// ---------------------------------------------------------------------

async function build(data, outPath) {
  const themes = data.themes && data.themes.length ? data.themes : DEFAULT_THEMES;

  const children = [
    ...coverPage(data.cover),
    ...tocPage(),
    ...hookPage(data.hook),
  ];

  data.parts.forEach((part, i) => {
    children.push(...partSection({ part, index: i, themes }));
  });

  children.push(...conclusionPage(data.conclusion));

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE.width, height: PAGE.height },
            margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          },
        },
        headers: {
          default: new Header({ children: [new Paragraph("")] }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "999999" })],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);

  // --- estimate the "Look Inside" ~10% cutoff (rough, page-count based) ---
  return outPath;
}

// ---------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------

if (require.main === module) {
  const dataPath = process.argv[2];
  const outPath = process.argv[3] || "output.docx";
  if (!dataPath) {
    console.error("Usage: node build_docx_template.js path/to/data.js output.docx");
    process.exit(1);
  }
  const data = require(path.resolve(dataPath));
  build(data, outPath).then(() => {
    console.log(`Manuscrito gerado: ${outPath}`);
    console.log(
      "Lembrete: renderize em JPEG (soffice + pdftoppm) e confira visualmente antes de entregar."
    );
  });
}

module.exports = { build, DEFAULT_THEMES };
