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

Override this folder location with the `DOCUMENT_ASSETS_DIR` environment variable.

> The assets cache is read once per process start — restart the backend after
> adding or changing files.
