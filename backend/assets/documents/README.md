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
| `cert-logo.png` | Certificate header logo (with banner), from the reference artwork | keep as shipped |
| `cert-govt-emblem.png` | Govt emblem in the certificate's incorporation panel | keep as shipped |

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

Override this folder location with the `DOCUMENT_ASSETS_DIR` environment variable.

> The assets cache is read once per process start — restart the backend after
> adding or changing files.
