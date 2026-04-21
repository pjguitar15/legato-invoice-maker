# Legato Invoice Maker

Legato Invoice Maker is a small React + TypeScript + Vite app for building a quotation for Legato Sounds and Lights, reviewing it as a printable document, and exporting that document to PDF.

The app has two screens:

- `/`: builder screen for invoice metadata and package selections
- `/review-invoice`: document preview and PDF export screen

## Stack

- React 19
- TypeScript
- Vite
- React Router
- MUI (`@mui/material`) for layout, form controls, and document layout
- `react-icons` for equipment/category icons
- `html2canvas` for DOM-to-canvas rendering
- `jspdf` for PDF generation

## How The App Works

### App flow

1. The app boots from [src/main.tsx](/d:/Philcob/Code/legato-invoice-maker/src/main.tsx), wraps the UI in `BrowserRouter`, and provides shared builder state through `InvoiceBuilderProvider`.
2. [src/App.tsx](/d:/Philcob/Code/legato-invoice-maker/src/App.tsx) defines two routes:
   - `CreateInvoice`
   - `ReviewInvoice`
3. On the create screen, the user edits top-level quotation fields and toggles equipment selections.
4. All state is stored in React context and persisted to `localStorage`.
5. On the review screen, the selected data is transformed into a quotation document.
6. Export renders a hidden A4-sized version of the document, captures it with `html2canvas`, slices it into A4 page segments, and saves a PDF with `jsPDF`.

### State ownership

All editable app data lives in [src/context/InvoiceBuilderContext.tsx](/d:/Philcob/Code/legato-invoice-maker/src/context/InvoiceBuilderContext.tsx).

The context exposes:

- `formValues`
- `sections`
- `handleFieldChange(event)`
- `handleCheckClick(sectionId, id)`

This means the form screen and the review screen both read from the same source of truth.

## Data Model

### `InvoiceFormValues`

The top-level form state is a flat object of strings:

```ts
type InvoiceFormValues = {
  invoiceNumber: string
  clientName: string
  eventVenue: string
  preparedBy: string
  preparedDate: string
  eventDate: string
  packageOnePrice: string
  ledWallPrice: string
  orFeePrice: string
  transpoFeePrice: string
}
```

Important details:

- Even numeric-looking values are stored as strings.
- Date inputs are stored as raw `YYYY-MM-DD` strings from the HTML date fields.
- Totals are only parsed into numbers at review/export time.

### Section and equipment structures

The package builder uses section objects from [src/components/Form/components/list-checker/listCheckerProps.ts](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/list-checker/listCheckerProps.ts).

```ts
type ListItemData = {
  id: number
  isChecked: boolean
  name: string
  type: EquipmentTypes
}

type LabelAndEquipmentProps = {
  id: number
  label: string
  singleSelect?: boolean
  equipment: ListItemData[]
}
```

`EquipmentTypes` is a string enum-like object covering:

- `speaker`
- `mixer`
- `microphone`
- `led-wall`
- `fee`
- `subwoofer`
- `light`
- `accessory`
- `instrument`
- `amplifier`
- `effect`

### Seed data

Initial builder data comes from [src/components/Form/components/list-checker/testData.ts](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/list-checker/testData.ts) as `SAMPLE_OBJECT_ARRAY`.

Current sections:

- `1`: Audio System
- `2`: Lighting System
- `3`: Vocal Microphones
- `4`: LED Wall
- `5`: Official Receipt Fee
- `6`: Transportation Fee

Behavior rules:

- Sections `1`, `2`, and `3` allow multiple checked items.
- Section `4` (`LED Wall`) uses `singleSelect: true`, so selecting one option clears the others.
- Sections `5` and `6` are effectively simple toggle fees.

### Persistence

The context persists both `formValues` and `sections` under the `localStorage` key:

```ts
const STORAGE_KEY = 'legato-invoice-builder'
```

Load behavior:

- On mount, the provider tries to load saved JSON.
- If parsing fails, it clears the corrupted entry.
- Saved `formValues` are merged over defaults.
- Saved `sections` fully replace the initial seeded sections.

## Builder Screen

The create screen is implemented in [src/pages/CreateInvoice.tsx](/d:/Philcob/Code/legato-invoice-maker/src/pages/CreateInvoice.tsx).

It renders:

- `Fields`
- `ListChecker`
- a button linking to `/review-invoice`

### Form fields

[src/components/Form/components/fields/Fields.tsx](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/fields/Fields.tsx) drives the metadata form from a `fieldConfig` array. This is the convention used for the top section of the builder: add a config object first, then let the generic `Field` component render it.

The shared `Field` component in [src/components/Form/components/fields/Field.tsx](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/fields/Field.tsx):

- renders an MUI `TextField`
- binds `name`, `value`, and `onChange`
- applies `slotProps.inputLabel.shrink` for date fields

### Equipment list

[src/components/Form/components/list-checker/ListChecker.tsx](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/list-checker/ListChecker.tsx) renders every section and its equipment items.

Each row is rendered by [src/components/Form/components/list-checker/List.tsx](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/list-checker/List.tsx), which:

- picks an icon from `equipmentIcons`
- shows the item name
- toggles the selection state with `handleCheckClick`
- uses `memo` to avoid unnecessary rerenders of list rows

## Review Screen

The document preview/export screen is [src/pages/ReviewInvoice.tsx](/d:/Philcob/Code/legato-invoice-maker/src/pages/ReviewInvoice.tsx).

### Document assembly

The page derives its document content from context state in a few steps:

1. `packageSections`
   - filters sections `1`, `2`, and `3`
   - keeps only checked equipment
   - drops empty sections
2. `ledWallSelection`
   - finds the selected item in section `4`
3. `hasOrFee` and `hasTranspoFee`
   - check the first item in sections `5` and `6`
4. `summaryRows`
   - builds optional rows for LED wall, OR fee, and transportation fee
5. `grandTotal`
   - adds `packageOnePrice` to all optional row totals

This means the quotation table is not a generic pricing engine. It is a purpose-built document model with one main package row plus up to three optional add-on rows.

### Formatting helpers

[src/utils/invoiceFormatting.ts](/d:/Philcob/Code/legato-invoice-maker/src/utils/invoiceFormatting.ts) contains two small display helpers:

- `formatDisplayDate(value)`
  - parses a date-like string
  - formats it as US long date, for example `January 29, 2026`
- `formatCurrency(value)`
  - converts numeric strings to a Philippine-style grouped number string
  - returns the raw value with a `P` prefix when parsing fails

Note that the review page often adds `P` in the JSX, so the formatter mostly returns the numeric portion for valid numbers.

## How PDF Export Works

The export implementation is inside `handleExportPdf` in [src/pages/ReviewInvoice.tsx](/d:/Philcob/Code/legato-invoice-maker/src/pages/ReviewInvoice.tsx).

### Rendering strategy

The page renders two versions of the document:

- a visible preview container for the user
- a hidden off-screen export container referenced by `exportRef`

The export container is:

- fixed off-screen with `left: '-200vw'`
- invisible with `opacity: 0`
- locked to `794px` width, which matches an A4 layout target in pixels

This is important because the PDF should be based on a stable document width rather than the responsive preview width.

### Capture pipeline

Export does the following:

1. Prevents duplicate exports with `isExporting`.
2. Waits for fonts using `await document.fonts.ready`.
3. Captures the hidden export node with `html2canvas`.
4. Uses:
   - `scale: 2` for higher-resolution raster output
   - `useCORS: true`
   - explicit `width`, `height`, `windowWidth`, and `windowHeight` based on the export node scroll size
5. Creates an A4 `jsPDF` document in portrait millimeters.
6. Calculates how much vertical canvas content fits into one PDF page after margins.
7. Slices the tall canvas into page-sized canvases.
8. Adds each slice as a PNG image to the PDF.
9. Saves the file as:

```ts
quotation-${formValues.invoiceNumber || 'draft'}.pdf
```

### Export implications

This is a raster export pipeline, not vector/PDF-native layout. That has a few practical consequences:

- Output fidelity depends on DOM rendering plus canvas capture.
- The PDF content is image-based, not selectable text.
- A4 pagination is handled manually by slicing the rendered canvas.
- The hidden export document should stay visually stable, since layout changes directly affect page breaks.

## Styles And Visual Conventions

### Styling approach

The codebase mainly uses MUI `Box`, `Typography`, `Button`, `Divider`, and `TextField` with `sx` objects inline or imported from shared style modules.

There are three style layers:

1. Global CSS:
   - [src/index.css](/d:/Philcob/Code/legato-invoice-maker/src/index.css)
   - sets the global Montserrat font and removes body margin
2. Shared constants:
   - [src/mainStyleConst.ts](/d:/Philcob/Code/legato-invoice-maker/src/mainStyleConst.ts)
   - currently `DEFAULT_BACKGROUND_COLOR` and `DEFAULT_PADDING`
3. Local `sx` style objects:
   - shared form styles in [src/components/Form/components/formStyles.ts](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/formStyles.ts)
   - page/component-specific styles inline in each component

### Visual language

Current UI conventions:

- neutral light-gray builder background: `#efeff4`
- white cards/rows on top of the gray background
- Montserrat as the shared font family
- uppercase small section headings in the builder
- dense, utility-like admin UI for input screens
- clean document-style white canvas for the review/export screen

### PDF/document styling

The quotation document is intentionally styled more like a printable business document than an app screen:

- fixed-width A4 composition
- black table header
- muted gray typography for secondary details
- explicit borders and grid layout for the pricing table
- signature area and static terms section at the bottom

## Object And Logic Conventions

### Naming

Common naming patterns in the repo:

- React components use PascalCase
- helpers and local functions use camelCase
- shared constants use uppercase snake case when they are true constants
- section/equipment objects use numeric `id`

### Data conventions

- Form inputs remain stringly typed until display/export calculations.
- Checkbox state is stored directly on each equipment item as `isChecked`.
- Section behavior is encoded in data via `singleSelect` rather than separate component branches.
- The review page uses section IDs as business logic selectors.

Those IDs currently mean:

- `1-3`: package inclusions
- `4`: LED wall
- `5`: OR fee
- `6`: transportation fee

If those sections change, the review/export logic must change with them.

### Component conventions

- Routing is flat and minimal.
- Shared state is centralized in one context provider.
- Reusable form rendering is config-driven.
- MUI `sx` objects are preferred over separate CSS modules.
- Display logic and export logic are colocated in the review page.

## Repository Map

Key files:

- [src/main.tsx](/d:/Philcob/Code/legato-invoice-maker/src/main.tsx): app bootstrap
- [src/App.tsx](/d:/Philcob/Code/legato-invoice-maker/src/App.tsx): route definitions
- [src/context/InvoiceBuilderContext.tsx](/d:/Philcob/Code/legato-invoice-maker/src/context/InvoiceBuilderContext.tsx): shared state, persistence, handlers
- [src/pages/CreateInvoice.tsx](/d:/Philcob/Code/legato-invoice-maker/src/pages/CreateInvoice.tsx): builder screen
- [src/pages/ReviewInvoice.tsx](/d:/Philcob/Code/legato-invoice-maker/src/pages/ReviewInvoice.tsx): document preview and export
- [src/components/Form/components/fields/Fields.tsx](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/fields/Fields.tsx): field config and render loop
- [src/components/Form/components/fields/Field.tsx](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/fields/Field.tsx): individual text/date/number field
- [src/components/Form/components/list-checker/ListChecker.tsx](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/list-checker/ListChecker.tsx): section renderer
- [src/components/Form/components/list-checker/List.tsx](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/list-checker/List.tsx): item row renderer
- [src/components/Form/components/list-checker/listCheckerProps.ts](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/list-checker/listCheckerProps.ts): object types and icon map
- [src/components/Form/components/list-checker/testData.ts](/d:/Philcob/Code/legato-invoice-maker/src/components/Form/components/list-checker/testData.ts): seed data
- [src/utils/invoiceFormatting.ts](/d:/Philcob/Code/legato-invoice-maker/src/utils/invoiceFormatting.ts): date/currency formatting

## Development

Install and run:

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build
npm run lint
npm run preview
```

## Notes For Future Changes

- If you add new billable sections, update both the seed data and the review-page summary-row logic.
- If you change the shape of stored context data, consider migration behavior for existing `localStorage` data.
- If you modify document layout significantly, verify export pagination because PDF page slicing depends on rendered height.
- If you want selectable text in exported PDFs, this export approach would need to be replaced with a PDF-native rendering strategy.
