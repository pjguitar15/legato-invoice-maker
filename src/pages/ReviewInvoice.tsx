import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { Link as RouterLink, Navigate, useParams } from 'react-router'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { FiDownload, FiEdit3, FiLayout } from 'react-icons/fi'
import { DEFAULT_BACKGROUND_COLOR } from '../mainStyleConst'
import legatoLogo from '../assets/legato-black.png'
import {
  CUSTOM_PACKAGE_ID,
  createRandomInvoiceNumber,
  getPackageTemplate,
} from '../context/invoiceBuilderConfig'
import { useInvoiceBuilder } from '../context/useInvoiceBuilder'
import {
  SECTION_IDS,
  ITEM_IDS,
} from '../components/Form/components/list-checker/testData'
import { formatCurrency, formatDisplayDate } from '../utils/invoiceFormatting'

const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = Math.round((A4_WIDTH_PX * 297) / 210)
const PAGE_PADDING = '0.45in 0.4in 0.55in'
const PAGE_CONTENT_HEIGHT_PX = Math.round(A4_HEIGHT_PX - 0.45 * 96 - 0.55 * 96)
const PAGE_OVERFLOW_BUFFER_PX = 36
const packageSectionIds: string[] = [
  SECTION_IDS.AUDIO_SYSTEM,
  SECTION_IDS.LIGHTING_SYSTEM,
  SECTION_IDS.MICROPHONE,
  SECTION_IDS.DRUMS,
  SECTION_IDS.AMPLIFIERS,
  SECTION_IDS.OTHERS,
  SECTION_IDS.CREW_AND_TRANSPORT,
  SECTION_IDS.ADD_ONS,
]
const DEFAULT_PREPARED_BY = 'Philson S. Josol'
const signatureAssetModules = import.meta.glob(
  '../assets/philson-signature.png',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>
const philsonSignature = Object.values(signatureAssetModules)[0]

const terms = [
  {
    title: 'Event Duration',
    body: 'Our standard service covers up to 6 hours of event time, including programme proper and live performances. Additional hours will be charged at P2,000 per hour.',
  },
  {
    title: 'Crew Meals',
    body: 'The client shall provide crew meals for all Legato Sounds & Lights personnel assigned to the event.',
  },
  {
    title: 'Down Payment & Balance',
    body: 'A 50% down payment is required to confirm the booking and reserve the event date. The remaining 50% balance is due on or before the event day.',
  },
  {
    title: 'Delivery, Setup, and Dismantling',
    body: 'Delivery and setup will be done at the agreed venue and schedule. Please ensure the venue is accessible for equipment load-in and load-out. Clients must coordinate access with the venue ahead of time.',
  },
  {
    title: 'Power Requirements',
    body: 'The client shall ensure that the venue provides stable electrical supply, dedicated circuits for sound and lights, and proper grounding to avoid equipment damage.',
  },
  {
    title: 'Equipment Safety',
    body: 'The client is responsible for maintaining a safe environment for the equipment and crew. Any loss or damage to equipment caused by negligence, guests, or external parties will be charged to the client.',
  },
  {
    title: 'Weather Conditions (for Outdoor Events)',
    body: 'For outdoor events, the client must provide tenting or roofing to protect sound and lighting equipment. In cases of heavy rain or unsafe conditions, Legato reserves the right to pause or halt operations to protect equipment.',
  },
  {
    title: 'Cancellation Policy',
    body: 'Down payments are non-refundable, but may be transferred to another available date if requested at least 14 days before the event. If the requested new date is already booked, the payment will remain as a credit for any future available date within the next 12 months.',
  },
]

const parseAmount = (value: string) => {
  const amount = Number(value)
  return Number.isNaN(amount) ? 0 : amount
}

const roundUpToNearestFiveHundred = (value: number) =>
  Math.ceil(value / 500) * 500

const sanitizeFilenamePart = (value: string, fallback: string) => {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return sanitized || fallback
}

type SummaryRow = {
  title: string
  total: number
}

type TableRow =
  | {
      id: string
      kind: 'package-section'
      no?: string
      description: string
      total?: string
      emphasize?: boolean
    }
  | {
      id: string
      kind: 'package-item'
      description: string
    }
  | {
      id: string
      kind: 'summary'
      no: string
      description: string
      total: string
    }
  | {
      id: string
      kind: 'grand-total'
      total: string
    }

type DocumentContentProps = {
  formValues: ReturnType<typeof useInvoiceBuilder>['formValues']
  invoiceNumber: string
  packageSections: Array<
    ReturnType<typeof useInvoiceBuilder>['sections'][number] & {
      equipment: ReturnType<
        typeof useInvoiceBuilder
      >['sections'][number]['equipment']
    }
  >
  preparedDate: string
  summaryRows: SummaryRow[]
  grandTotal: number
}

type DocumentBlock = {
  id: string
  node: ReactNode
  gapAfter?: number
  paginationBuffer?: number
  keepWithNext?: boolean
  pageBreakAfter?: boolean
}

const buildTableRows = ({
  formValues,
  packageSections,
  summaryRows,
  grandTotal,
}: Pick<
  DocumentContentProps,
  'formValues' | 'packageSections' | 'summaryRows' | 'grandTotal'
>): TableRow[] => {
  const packageRows =
    packageSections.length > 0
      ? packageSections.flatMap((section, sectionIndex) => [
          {
            id: `package-section-${section.id}`,
            kind: 'package-section' as const,
            no: sectionIndex === 0 ? '01' : undefined,
            description: section.label,
            total:
              sectionIndex === 0
                ? `P${formatCurrency(formValues.packageOnePrice)}`
                : undefined,
            emphasize: true,
          },
          ...section.equipment.map((item) => ({
            id: `package-item-${section.id}-${item.id}`,
            kind: 'package-item' as const,
            description: item.name,
          })),
        ])
      : [
          {
            id: 'package-empty',
            kind: 'package-item' as const,
            description:
              'Select package items from the builder page to populate this invoice.',
          },
        ]

  const addOnRows = summaryRows.map((row, index) => ({
    id: `summary-${index + 2}`,
    kind: 'summary' as const,
    no: String(index + 2).padStart(2, '0'),
    description: row.title,
    total: `P${formatCurrency(String(row.total))}`,
  }))

  return [
    ...packageRows,
    ...addOnRows,
    {
      id: 'grand-total',
      kind: 'grand-total',
      total: `TOTAL: P${formatCurrency(String(grandTotal))}`,
    },
  ]
}

const DocumentHeaderBlock = ({
  formValues,
  invoiceNumber,
  preparedDate,
  documentType,
}: Pick<
  DocumentContentProps,
  'formValues' | 'invoiceNumber' | 'preparedDate'
> & { documentType: 'Invoice' | 'Quotation' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: '#2b2e3a',
          }}
        >
          Legato Sounds and Lights
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 500,
            color: '#4b4f5c',
            maxWidth: '24rem',
          }}
        >
          Block 27 lot 9, St. Joseph Homes, Brgy. Inocencio Trece Martires City,
          Cavite
        </Typography>
      </Box>
      <Box
        sx={{
          width: '13rem',
          height: 'auto',
          borderRadius: '50px',
        }}
      >
        <img
          style={{ width: '100%', objectFit: 'cover' }}
          src={legatoLogo}
          alt='Legato Sounds and Lights'
        />
      </Box>
    </Box>

    <Box>
      <Typography
        sx={{
          fontSize: { xs: 34, md: 44 },
          lineHeight: 1,
          fontWeight: 700,
          color: '#464854',
        }}
      >
        {documentType}
      </Typography>
      <Typography
        sx={{
          fontSize: 15,
          marginTop: '0.35rem',
          letterSpacing: '0.06em',
          color: '#b3afb1',
          fontWeight: 700,
        }}
      >
        {documentType.toUpperCase()} #{invoiceNumber || '----'}
      </Typography>
    </Box>

    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 3,
      }}
    >
      <Box sx={{ flex: '1 1 18rem' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#47506a' }}>
          PREPARED FOR {formValues.clientName || ' '}
        </Typography>
        <Typography sx={{ fontSize: 14, marginTop: '2rem' }}>
          Event Venue:{' '}
          <Box component='span' sx={{ fontWeight: 500 }}>
            {formValues.eventVenue || ' '}
          </Box>
        </Typography>
      </Box>
      <Box sx={{ minWidth: '12rem' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#47506a' }}>
          PREPARED DATE
        </Typography>
        <Typography sx={{ fontSize: 14, marginBottom: '0.8rem' }}>
          {formatDisplayDate(preparedDate)}
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#47506a' }}>
          EVENT DATE
        </Typography>
        <Typography sx={{ fontSize: 14 }}>
          {formatDisplayDate(formValues.eventDate)}
        </Typography>
      </Box>
    </Box>

    <Divider />
  </Box>
)

const TableHeader = () => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '44px minmax(0, 1fr) 126px',
      background: '#040404',
      color: '#ffffff',
      fontSize: 13,
      fontWeight: 700,
      borderLeft: '1px solid #dfe3eb',
      borderRight: '1px solid #dfe3eb',
    }}
  >
    <Box sx={{ padding: '0.75rem 0.5rem', borderRight: '1px solid #dfe3eb' }}>
      No.
    </Box>
    <Box sx={{ padding: '0.75rem 0.6rem', borderRight: '1px solid #dfe3eb' }}>
      Package Inclusions
    </Box>
    <Box sx={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>TOTAL</Box>
  </Box>
)

const TableRowView = ({ row }: { row: TableRow }) => {
    if (row.kind === 'grand-total') {
      return (
        <Box
          sx={{
            borderTop: '2px solid #dfe3eb',
            borderLeft: '1px solid #dfe3eb',
            borderRight: '1px solid #dfe3eb',
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '1rem 0.9rem',
          }}
        >
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#394158' }}>
          {row.total}
        </Typography>
      </Box>
    )
  }

  return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '44px minmax(0, 1fr) 126px',
          minHeight: row.kind === 'package-item' ? '1.95rem' : '3rem',
          borderTop: row.kind === 'summary' ? '1px solid #dfe3eb' : 'none',
          borderLeft: '1px solid #dfe3eb',
          borderRight: '1px solid #dfe3eb',
        }}
      >
      <Box
        sx={{
          borderRight: '1px solid #dfe3eb',
          padding: '0.65rem 0.5rem',
          fontSize: 14,
          color: row.kind === 'package-item' ? 'transparent' : '#2b2e3a',
        }}
      >
        {'no' in row ? (row.no ?? ' ') : ' '}
      </Box>
      <Box
        sx={{
          borderRight: '1px solid #dfe3eb',
          padding:
            row.kind === 'package-item' ? '0.28rem 0.7rem' : '0.65rem 0.7rem',
          fontSize: row.kind === 'package-item' ? 13.5 : 14,
          fontWeight:
            row.kind === 'package-item'
              ? 500
              : row.kind === 'package-section' && row.emphasize
                ? 700
                : 600,
          color: row.kind === 'package-item' ? '#4f5868' : '#2f3746',
          lineHeight: row.kind === 'package-item' ? 1.2 : 1.35,
        }}
      >
        {row.kind === 'package-item' ? `• ${row.description}` : row.description}
      </Box>
      <Box
        sx={{
          padding: '0.65rem 0.7rem',
          fontSize: 14,
          textAlign: 'right',
          fontWeight: row.kind === 'summary' ? 600 : 500,
          color: '#2f3746',
        }}
      >
        {'total' in row ? (row.total ?? ' ') : ' '}
      </Box>
    </Box>
  )
}

const SummaryTableBlock = ({ rows }: { rows: TableRow[] }) => (
  <Box>
    <TableHeader />
    {rows.map((row) => (
      <TableRowView key={row.id} row={row} />
    ))}
  </Box>
)

const TermsHeadingBlock = () => (
  <Box sx={{ paddingTop: '0.5rem' }}>
    <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
      TERMS AND CONDITIONS:
    </Typography>
  </Box>
)

const TermBlock = ({
  index,
  term,
}: {
  index: number
  term: (typeof terms)[number]
}) => (
  <Box>
    <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
      {index + 1}. {term.title}
    </Typography>
    <Typography sx={{ fontSize: 13.5, lineHeight: 1.45 }}>
      {term.body}
    </Typography>
  </Box>
)

const SignatureBlock = () => (
  <Box
    sx={{
      paddingTop: '1.5rem',
      display: 'flex',
      justifyContent: 'flex-end',
    }}
  >
    <Box sx={{ width: '18rem', textAlign: 'center' }}>
      <Box
        sx={{
          height: '4.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #6c7487',
        }}
      >
        {philsonSignature ? (
          <img
            src={philsonSignature}
            alt='Philson signature'
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <Box
            sx={{
              color: '#8a92a2',
              fontSize: 14,
              letterSpacing: '0.06em',
            }}
          >
            SIGNATURE HERE
          </Box>
        )}
      </Box>
      <Typography sx={{ fontSize: 15, fontWeight: 700, marginTop: '0.55rem' }}>
        {DEFAULT_PREPARED_BY}
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#707786' }}>
        Proprietor, Legato Sounds and Lights
      </Typography>
    </Box>
  </Box>
)

const PageContent = ({ blocks }: { blocks: DocumentBlock[] }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    {blocks.map((block, index) => (
      <Box
        key={block.id}
        sx={{
          marginBottom:
            index === blocks.length - 1 ? 0 : (block.gapAfter ?? 24),
        }}
      >
        {block.node}
      </Box>
    ))}
  </Box>
)

const TermsSectionBlocks = ({ blocks }: { blocks: DocumentBlock[] }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {blocks.map((block) => (
      <Box key={block.id}>{block.node}</Box>
    ))}
  </Box>
)

const buildTableBlocks = (rows: TableRow[][]): DocumentBlock[] =>
  rows.map((pageRows, index) => ({
    id: `summary-table-${index + 1}`,
    node: <SummaryTableBlock rows={pageRows} />,
    gapAfter: 0,
    pageBreakAfter: true,
  }))

const buildDocumentBlocks = ({
  formValues,
  invoiceNumber,
  preparedDate,
  documentType,
  tableBlocks,
}: Pick<
  DocumentContentProps,
  'formValues' | 'invoiceNumber' | 'preparedDate'
> & {
  documentType: 'Invoice' | 'Quotation'
  tableBlocks: DocumentBlock[]
}): DocumentBlock[] => {
  const termsBlocks: DocumentBlock[] = [
    {
      id: 'terms-heading',
      node: <TermsHeadingBlock />,
      paginationBuffer: 12,
      keepWithNext: true,
    },
    ...terms.map((term, index) => ({
      id: `term-${index + 1}`,
      node: <TermBlock index={index} term={term} />,
      paginationBuffer: 28,
    })),
  ]

  return [
    {
      id: 'header',
      node: (
        <DocumentHeaderBlock
          formValues={formValues}
          invoiceNumber={invoiceNumber}
          preparedDate={preparedDate}
          documentType={documentType}
        />
      ),
      gapAfter: 0,
    },
    ...tableBlocks,
    {
      id: 'terms-section',
      node: <TermsSectionBlocks blocks={termsBlocks} />,
      gapAfter: 24,
      paginationBuffer: 24,
    },
    {
      id: 'signature',
      node: <SignatureBlock />,
      gapAfter: 0,
      paginationBuffer: 20,
    },
  ]
}

const ReviewInvoice = () => {
  const { packageId } = useParams()
  const template = packageId ? getPackageTemplate(packageId) : undefined
  const isCustomPackage = packageId === CUSTOM_PACKAGE_ID
  const { activePackageId, formValues, sections, selectPackageTemplate } =
    useInvoiceBuilder()
  const exportPageRefs = useRef<Array<HTMLDivElement | null>>([])
  const measureBlockRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const measureTableRowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [isExporting, setIsExporting] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportFilename, setExportFilename] = useState('')
  const [documentType, setDocumentType] = useState<'Invoice' | 'Quotation'>('Invoice')
  const [measuredBlockHeights, setMeasuredBlockHeights] = useState<
    Record<string, number>
  >({})
  const [measuredTableRowHeights, setMeasuredTableRowHeights] = useState<
    Record<string, number>
  >({})
  const invoiceNumber = useMemo(() => createRandomInvoiceNumber(), [])
  const preparedDate = useMemo(() => new Date().toISOString().slice(0, 10), [])

  useEffect(() => {
    if (!packageId || !template || activePackageId === packageId) {
      return
    }

    selectPackageTemplate(packageId)
  }, [activePackageId, packageId, selectPackageTemplate, template])

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  }, [packageId])

  const isInvalidRoute = !packageId || (!template && !isCustomPackage)

  const packageSections = sections
    .filter((section) => packageSectionIds.includes(section.id))
    .map((section) => ({
      ...section,
      equipment: section.equipment.filter((item) => item.isChecked),
    }))
    .filter((section) => section.equipment.length > 0)

  const ledWallSelection = sections
    .find((section) => section.id === SECTION_IDS.LED_WALL)
    ?.equipment.find((item) => item.isChecked)

  const hasOrFee = Boolean(
    sections.find(
      (section) => section.id === SECTION_IDS.OFFICIAL_RECEIPT_FEE,
    )?.equipment[0]?.isChecked,
  )
  const hasTranspoFee = Boolean(
    sections.find(
      (section) => section.id === SECTION_IDS.TRANSPORTATION_FEE,
    )?.equipment[0]?.isChecked,
  )
  const hasRiser = Boolean(
    sections.find(
      (section) => section.id === SECTION_IDS.LED_WALL_RISER,
    )?.equipment[0]?.isChecked,
  )

  const packageTotal = parseAmount(formValues.packageOnePrice)
  const ledWallTotal = ledWallSelection
    ? ledWallSelection.id === ITEM_IDS.LED_WALL_9X14
      ? 18000
      : ledWallSelection.id === ITEM_IDS.LED_WALL_9X12
        ? 15000
        : 0
    : 0
  const riserTotal =
    hasRiser && ledWallSelection?.id === ITEM_IDS.LED_WALL_9X14
      ? 2000
      : hasRiser && ledWallTotal > 0
        ? 3000
        : 0
  const transpoTotal = hasTranspoFee
    ? parseAmount(formValues.transpoFeePrice)
    : 0
  const subtotalBeforeOr =
    packageTotal + ledWallTotal + riserTotal + transpoTotal
  const orFeeTotal = hasOrFee
    ? roundUpToNearestFiveHundred(subtotalBeforeOr * 0.12)
    : 0

  const summaryRows: SummaryRow[] = [
    ledWallSelection
      ? {
          title: ledWallSelection.name,
          total: ledWallTotal,
        }
      : null,
    riserTotal > 0
      ? {
          title: 'LED Wall Riser',
          total: riserTotal,
        }
      : null,
    hasOrFee
      ? {
          title: 'OR Fee',
          total: orFeeTotal,
        }
      : null,
    hasTranspoFee
      ? {
          title: 'Transpo fee',
          total: transpoTotal,
        }
      : null,
  ].filter(Boolean) as SummaryRow[]

  const grandTotal = subtotalBeforeOr + orFeeTotal

  const tableRows = useMemo(
    () =>
      buildTableRows({
        formValues,
        packageSections,
        summaryRows,
        grandTotal,
      }),
    [formValues, grandTotal, packageSections, summaryRows],
  )

  useLayoutEffect(() => {
    const nextHeights = Object.fromEntries(
      tableRows.map((row) => [
        row.id,
        Math.ceil(
          measureTableRowRefs.current[row.id]?.getBoundingClientRect().height ??
            0,
        ),
      ]),
    )

    setMeasuredTableRowHeights((current) => {
      const currentKeys = Object.keys(current)
      const nextKeys = Object.keys(nextHeights)

      if (
        currentKeys.length === nextKeys.length &&
        nextKeys.every((key) => current[key] === nextHeights[key])
      ) {
        return current
      }

      return nextHeights
    })
  }, [tableRows])

  const paginatedTableRows = useMemo(() => {
    const tableHeaderHeight = 44

    if (tableRows.some((row) => !measuredTableRowHeights[row.id])) {
      return [tableRows]
    }

    const headerHeight = measuredBlockHeights.header ?? 0
    const firstPageAvailableHeight = Math.max(
      PAGE_CONTENT_HEIGHT_PX - headerHeight - PAGE_OVERFLOW_BUFFER_PX,
      tableHeaderHeight,
    )

    const pages: TableRow[][] = []
    let currentPage: TableRow[] = []
    let currentHeight = tableHeaderHeight
    let currentPageLimit = firstPageAvailableHeight

    tableRows.forEach((row) => {
      const rowHeight = measuredTableRowHeights[row.id]

      if (
        currentPage.length > 0 &&
        currentHeight + rowHeight > currentPageLimit
      ) {
        pages.push(currentPage)
        currentPage = [row]
        currentHeight = tableHeaderHeight + rowHeight
        currentPageLimit = PAGE_CONTENT_HEIGHT_PX - PAGE_OVERFLOW_BUFFER_PX
        return
      }

      currentPage.push(row)
      currentHeight += rowHeight
    })

    if (currentPage.length > 0) {
      pages.push(currentPage)
    }

    return pages
  }, [measuredBlockHeights.header, measuredTableRowHeights, tableRows])

  const tableBlocks = useMemo(
    () => buildTableBlocks(paginatedTableRows),
    [paginatedTableRows],
  )

  const documentBlocks = useMemo(
    () =>
      buildDocumentBlocks({
        formValues,
        invoiceNumber,
        preparedDate,
        documentType,
        tableBlocks,
      }),
    [documentType, formValues, invoiceNumber, preparedDate, tableBlocks],
  )

  useLayoutEffect(() => {
    const nextHeights = Object.fromEntries(
      documentBlocks.map((block) => [
        block.id,
        Math.ceil(
          measureBlockRefs.current[block.id]?.getBoundingClientRect().height ??
            0,
        ),
      ]),
    )

    setMeasuredBlockHeights((current) => {
      const currentKeys = Object.keys(current)
      const nextKeys = Object.keys(nextHeights)

      if (
        currentKeys.length === nextKeys.length &&
        nextKeys.every((key) => current[key] === nextHeights[key])
      ) {
        return current
      }

      return nextHeights
    })
  }, [documentBlocks])

  const paginatedBlocks = useMemo(() => {
    if (documentBlocks.some((block) => !measuredBlockHeights[block.id])) {
      return [documentBlocks]
    }

    const pages: DocumentBlock[][] = []
    let currentPage: DocumentBlock[] = []
    let currentHeight = 0

    documentBlocks.forEach((block, index) => {
      const blockHeight =
        measuredBlockHeights[block.id] + (block.paginationBuffer ?? 0)
      const gapHeight =
        currentPage.length > 0
          ? (currentPage[currentPage.length - 1].gapAfter ?? 24)
          : 0
      const nextBlock = documentBlocks[index + 1]
      const keepWithNextHeight =
        block.keepWithNext && nextBlock
          ? (block.gapAfter ?? 24) +
            measuredBlockHeights[nextBlock.id] +
            (nextBlock.paginationBuffer ?? 0)
          : 0

      if (
        currentPage.length > 0 &&
        currentHeight + gapHeight + blockHeight + keepWithNextHeight >
          PAGE_CONTENT_HEIGHT_PX - PAGE_OVERFLOW_BUFFER_PX
      ) {
        pages.push(currentPage)
        currentPage = [block]
        currentHeight = blockHeight
        return
      }

      currentPage.push(block)
      currentHeight += gapHeight + blockHeight

      if (block.pageBreakAfter) {
        pages.push(currentPage)
        currentPage = []
        currentHeight = 0
      }
    })

    if (currentPage.length > 0) {
      pages.push(currentPage)
    }

    return pages
  }, [documentBlocks, measuredBlockHeights])

  useEffect(() => {
    exportPageRefs.current = exportPageRefs.current.slice(
      0,
      paginatedBlocks.length,
    )
  }, [paginatedBlocks.length])

  if (isInvalidRoute) {
    return <Navigate to='/' replace />
  }

  const buildDefaultFilename = () => {
    const preparedForPart = sanitizeFilenamePart(formValues.clientName, 'client')
    const exportDatePart = preparedDate.replaceAll('-', '')
    return `legato-sounds-and-lights-invoice-${preparedForPart}-${invoiceNumber || 'draft'}-${exportDatePart}`
  }

  const handleExportClick = () => {
    if (isExporting) return
    setExportFilename(buildDefaultFilename())
    setExportModalOpen(true)
  }

  const handleExportPdf = async (filename: string) => {
    if (exportPageRefs.current.length === 0 || isExporting) return

    try {
      setIsExporting(true)
      await document.fonts.ready

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      for (const [pageIndex, pageRef] of exportPageRefs.current.entries()) {
        if (!pageRef) {
          throw new Error('Unable to find one or more export pages')
        }

        const canvas = await html2canvas(pageRef, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: pageRef.scrollWidth,
          height: pageRef.scrollHeight,
          windowWidth: pageRef.scrollWidth,
          windowHeight: pageRef.scrollHeight,
        })

        if (pageIndex > 0) {
          pdf.addPage()
        }

        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.86),
          'JPEG',
          0,
          0,
          pageWidth,
          pageHeight,
        )
      }

      pdf.save(`${filename.trim() || buildDefaultFilename()}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Box
      sx={{
        background: DEFAULT_BACKGROUND_COLOR,
        minHeight: '100vh',
        padding: { xs: '1rem', md: '2rem' },
        '@media print': {
          background: '#ffffff',
          padding: 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          '@media print': {
            display: 'none',
          },
        }}
      >
        <Button
          variant='outlined'
          onClick={() =>
            setDocumentType((t) => (t === 'Invoice' ? 'Quotation' : 'Invoice'))
          }
        >
          Switch to {documentType === 'Invoice' ? 'Quotation' : 'Invoice'}
        </Button>
        <Button
          component={RouterLink}
          to='/invoice-templates'
          variant='outlined'
          aria-label='Templates'
          sx={{
            minWidth: { xs: '3rem', sm: 'unset' },
            paddingInline: { xs: '0.8rem', sm: '1rem' },
          }}
        >
          <Box
            component='span'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <FiLayout />
          </Box>
          <Box
            component='span'
            sx={{
              display: { xs: 'none', sm: 'inline' },
              marginLeft: '0.5rem',
            }}
          >
            Templates
          </Box>
        </Button>
        <Button
          component={RouterLink}
          to={`/package/${packageId}`}
          variant='outlined'
          aria-label='Back to Edit'
          sx={{
            minWidth: { xs: '3rem', sm: 'unset' },
            paddingInline: { xs: '0.8rem', sm: '1rem' },
          }}
        >
          <Box
            component='span'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <FiEdit3 />
          </Box>
          <Box
            component='span'
            sx={{
              display: { xs: 'none', sm: 'inline' },
              marginLeft: '0.5rem',
            }}
          >
            Back to Edit
          </Box>
        </Button>
        <Button
          variant='contained'
          onClick={handleExportClick}
          disabled={isExporting}
          aria-label={isExporting ? 'Exporting PDF' : 'Export as PDF'}
          sx={{
            minWidth: { xs: '3rem', sm: 'unset' },
            paddingInline: { xs: '0.8rem', sm: '1rem' },
          }}
        >
          <Box
            component='span'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            <FiDownload />
          </Box>
          <Box
            component='span'
            sx={{
              display: { xs: 'none', sm: 'inline' },
              marginLeft: '0.5rem',
            }}
          >
            {isExporting ? 'Exporting...' : 'Export as PDF'}
          </Box>
        </Button>
      </Box>

      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x pan-y pinch-zoom',
          paddingBottom: '0.5rem',
        }}
      >
        <Box
          sx={{
            width: `${A4_WIDTH_PX}px`,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {paginatedBlocks.map((pageBlocks, index) => (
            <Box
              key={`preview-page-${index + 1}`}
              sx={{
                border: '1px solid #d9d9df',
                width: `${A4_WIDTH_PX}px`,
                height: `${A4_HEIGHT_PX}px`,
                margin: '0 auto',
                padding: PAGE_PADDING,
                background: '#ffffff',
                boxSizing: 'border-box',
                overflow: 'hidden',
                '@media print': {
                  border: 'none',
                },
              }}
            >
              <PageContent blocks={pageBlocks} />
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          left: '-200vw',
          top: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -2,
        }}
      >
        <Box
          sx={{
            width: `${A4_WIDTH_PX}px`,
            padding: PAGE_PADDING,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          <Box sx={{ border: '1px solid #dfe3eb' }}>
            <TableHeader />
            {tableRows.map((row) => (
              <Box
                key={`measure-row-${row.id}`}
                ref={(node: HTMLDivElement | null) => {
                  measureTableRowRefs.current[row.id] = node
                }}
              >
                <TableRowView row={row} />
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            width: `${A4_WIDTH_PX}px`,
            padding: PAGE_PADDING,
            boxSizing: 'border-box',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {documentBlocks.map((block, index) => (
            <Box
              key={`measure-${block.id}`}
              ref={(node: HTMLDivElement | null) => {
                measureBlockRefs.current[block.id] = node
              }}
              sx={{
                marginBottom:
                  index === documentBlocks.length - 1
                    ? 0
                    : (block.gapAfter ?? 24),
              }}
            >
              {block.node}
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          left: '-200vw',
          top: 0,
          width: `${A4_WIDTH_PX}px`,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {paginatedBlocks.map((pageBlocks, index) => (
          <Box
            key={`export-page-${index + 1}`}
            ref={(node: HTMLDivElement | null) => {
              exportPageRefs.current[index] = node
            }}
            sx={{
              width: `${A4_WIDTH_PX}px`,
              height: `${A4_HEIGHT_PX}px`,
              background: '#ffffff',
              boxSizing: 'border-box',
              padding: PAGE_PADDING,
              overflow: 'hidden',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            <PageContent blocks={pageBlocks} />
          </Box>
        ))}
      </Box>
      <Dialog
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Export as PDF</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: '#667085', mb: 2 }}>
            You can rename the file before saving, or keep the default name.
          </Typography>
          <TextField
            fullWidth
            label='File name'
            value={exportFilename}
            onChange={(e) => setExportFilename(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setExportModalOpen(false)
                handleExportPdf(exportFilename)
              }
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position='end'>.pdf</InputAdornment>
                ),
              },
            }}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant='outlined' onClick={() => setExportModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              setExportModalOpen(false)
              handleExportPdf(exportFilename)
            }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ReviewInvoice
