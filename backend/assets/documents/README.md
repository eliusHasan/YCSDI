# Document brand assets

Drop image files here to replace the placeholder graphics on generated PDFs
(registration card, admit card, marksheet, certificate). All are **optional** —
when a file is missing, a text/line placeholder is drawn instead.

| File | Used for | Recommended |
|------|----------|-------------|
| `logo.png` | Institute logo (top-left of documents) | square PNG, transparent bg, ~300×300 |
| `seal.png` | Faint centred watermark seal | square PNG, ~600×600 |
| `signature.png` | Primary signatory (Controller / Head / Exam Controller) | ~280×100, transparent |
| `signature-2.png` | Second signatory (Chairman, on the certificate) | ~280×100, transparent |
| `certificate-border.png` | Full-page guilloche border on the certificate | A4 landscape artwork |
| `cert-logo.png` | Certificate header logo (= the brand `logo.png`) | keep as shipped |
| `cert-govt-emblem.png` | Govt emblem in the certificate's incorporation panel | keep as shipped |
| `registration-border.png` / `marksheet-border.png` / `admit-border.png` | Transparent ornamental frame for each portrait document (border + watermark drawn from `logo.png`) | A4 portrait, keep as shipped |

`logo.png` is the institute brand mark used as the header logo on every document
and as the faint centred watermark on the portrait documents. Replace it to
rebrand all four PDFs at once.

## Certificate fonts (`fonts/`)

The certificate replicates the institute's reference artwork 1:1. The static
text uses font subsets extracted from that artwork (`latin-wide.otf`,
`arial-rounded-bold.otf`, `monotype-corsiva.otf`, `birgine.otf`,
`arial-narrow.otf`, `myriad-pro.otf`, `arial-italic.otf`). These subsets only
contain the glyphs of the fixed wording — do not use them for other text.

Dynamic fill-in values use `fonts/montecarlo.ttf` (MonteCarlo, OFL — the free
revival of Coronet). The original artwork uses **Coronet LT Std** (commercial);
if you license it, drop it in as `fonts/coronet.otf` and it is picked up
automatically.

## Portrait-document fonts (`fonts/`)

The registration card, marksheet, and admit card also replicate their reference
artwork 1:1. Fixed wording uses subsets extracted from those PDFs
(`doc-reg-badge.ttf` / `doc-res-badge.ttf` = Arial Black badges,
`doc-res-final.ttf` = Arial Bold "Final Results", `doc-calisto.ttf` +
`doc-californian-bold.ttf` = the marksheet grading table, `doc-arial-narrow.ttf`
= admit directions), plus the shared `latin-wide.otf` / `birgine.otf` header.
Dynamic values (names, course, GPA, etc.) use the metric-compatible OFL clones
`doc-calibri-bold.ttf` / `doc-calibri.ttf` (Carlito ≈ Calibri) and
`doc-arial.ttf` / `doc-arial-bold.ttf` (Arimo ≈ Arial).

Override this folder location with the `DOCUMENT_ASSETS_DIR` environment variable.

> The assets cache is read once per process start — restart the backend after
> adding or changing files.
