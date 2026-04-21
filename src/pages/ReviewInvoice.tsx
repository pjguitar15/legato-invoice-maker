import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Divider, Typography } from '@mui/material'
import { Link as RouterLink, Navigate, useParams } from 'react-router'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { DEFAULT_BACKGROUND_COLOR } from '../mainStyleConst'
import legatoLogo from '../assets/legato-black.png'
import {
  CUSTOM_PACKAGE_ID,
  createRandomInvoiceNumber,
  getPackageTemplate,
} from '../context/invoiceBuilderConfig'
import { useInvoiceBuilder } from '../context/useInvoiceBuilder'
import { formatCurrency, formatDisplayDate } from '../utils/invoiceFormatting'

const A4_WIDTH_PX = 794
const PDF_PAGE_MARGIN_MM = 10
const packageSectionIds = [1, 2, 3]
const DEFAULT_PREPARED_BY = 'Philson S. Josol'
const signatureAssetModules = import.meta.glob('../assets/philson-signature.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>
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

type SummaryRow = {
  no: string
  title: string
  total: number
}

type DocumentContentProps = {
  formValues: ReturnType<typeof useInvoiceBuilder>['formValues']
  invoiceNumber: string
  packageSections: Array<
    ReturnType<typeof useInvoiceBuilder>['sections'][number] & {
      equipment: ReturnType<typeof useInvoiceBuilder>['sections'][number]['equipment']
    }
  >
  preparedDate: string
  summaryRows: SummaryRow[]
  grandTotal: number
}

const InvoiceDocumentContent = ({
  formValues,
  invoiceNumber,
  packageSections,
  preparedDate,
  summaryRows,
  grandTotal,
}: DocumentContentProps) => (
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
        Invoice
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
        INVOICE #{invoiceNumber || '----'}
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

    <Box sx={{ border: '1px solid #dfe3eb' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '44px minmax(0, 1fr) 126px',
          background: '#040404',
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 700,
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '44px minmax(0, 1fr) 126px',
          borderTop: '1px solid #dfe3eb',
          minHeight: '30rem',
        }}
      >
        <Box
          sx={{
            borderRight: '1px solid #dfe3eb',
            padding: '1rem 0.5rem',
            display: 'flex',
            alignItems: 'flex-end',
            fontSize: 14,
          }}
        >
          01
        </Box>
        <Box sx={{ borderRight: '1px solid #dfe3eb', padding: '0.9rem 0.7rem 1.1rem' }}>
          {packageSections.length > 0 ? (
            packageSections.map((section) => (
              <Box key={section.id} sx={{ marginBottom: '1.25rem' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, marginBottom: '0.45rem' }}>
                  {section.label}:
                </Typography>
                {section.equipment.map((item) => (
                  <Typography
                    key={`${section.id}-${item.id}`}
                    sx={{ fontSize: 14, lineHeight: 1.45 }}
                  >
                    {item.name}
                  </Typography>
                ))}
              </Box>
            ))
          ) : (
            <Typography sx={{ fontSize: 14, color: '#697180' }}>
              Select audio, lighting, and microphone items from the builder page to
              populate this package.
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            padding: '1rem 0.7rem',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            fontSize: 14,
          }}
        >
          P{formatCurrency(formValues.packageOnePrice)}
        </Box>
      </Box>

      {summaryRows.map((row) => (
        <Box
          key={row.no}
          sx={{
            display: 'grid',
            gridTemplateColumns: '44px minmax(0, 1fr) 126px',
            borderTop: '1px solid #dfe3eb',
            minHeight: '3rem',
          }}
        >
          <Box sx={{ borderRight: '1px solid #dfe3eb', padding: '0.65rem 0.5rem', fontSize: 14 }}>
            {row.no}
          </Box>
          <Box
            sx={{
              borderRight: '1px solid #dfe3eb',
              padding: '0.65rem 0.7rem',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {row.title}
          </Box>
          <Box sx={{ padding: '0.65rem 0.7rem', fontSize: 14, textAlign: 'right' }}>
            P{formatCurrency(String(row.total))}
          </Box>
        </Box>
      ))}

      <Box
        sx={{
          borderTop: '1px solid #dfe3eb',
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '1rem 0.9rem',
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#394158' }}>
          TOTAL: P{formatCurrency(String(grandTotal))}
        </Typography>
      </Box>
    </Box>

    <Box sx={{ paddingTop: '0.5rem' }}>
      <Typography sx={{ fontSize: 15, fontWeight: 800, marginBottom: '1rem' }}>
        TERMS AND CONDITIONS:
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {terms.map((term, index) => (
          <Box key={term.title}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
              {index + 1}. {term.title}
            </Typography>
            <Typography sx={{ fontSize: 13.5, lineHeight: 1.45 }}>
              {term.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>

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
  </Box>
)

const ReviewInvoice = () => {
  const { packageId } = useParams()
  const template = packageId ? getPackageTemplate(packageId) : undefined
  const isCustomPackage = packageId === CUSTOM_PACKAGE_ID
  const { activePackageId, formValues, sections, selectPackageTemplate } =
    useInvoiceBuilder()
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const invoiceNumber = useMemo(() => createRandomInvoiceNumber(), [])
  const preparedDate = useMemo(() => new Date().toISOString().slice(0, 10), [])

  useEffect(() => {
    if (!packageId || !template || activePackageId === packageId) {
      return
    }

    selectPackageTemplate(packageId)
  }, [activePackageId, packageId, selectPackageTemplate, template])

  if (!packageId || (!template && !isCustomPackage)) {
    return <Navigate to='/' replace />
  }

  const packageSections = sections
    .filter((section) => packageSectionIds.includes(section.id))
    .map((section) => ({
      ...section,
      equipment: section.equipment.filter((item) => item.isChecked),
    }))
    .filter((section) => section.equipment.length > 0)

  const ledWallSelection = sections
    .find((section) => section.id === 4)
    ?.equipment.find((item) => item.isChecked)

  const hasOrFee = Boolean(
    sections.find((section) => section.id === 5)?.equipment[0]?.isChecked,
  )
  const hasTranspoFee = Boolean(
    sections.find((section) => section.id === 6)?.equipment[0]?.isChecked,
  )

  const summaryRows: SummaryRow[] = [
    ledWallSelection
      ? {
          no: '02',
          title: ledWallSelection.name,
          total: parseAmount(formValues.ledWallPrice),
        }
      : null,
    hasOrFee
      ? {
          no: '03',
          title: 'OR Fee',
          total: parseAmount(formValues.orFeePrice),
        }
      : null,
    hasTranspoFee
      ? {
          no: '04',
          title: 'Transpo fee',
          total: parseAmount(formValues.transpoFeePrice),
        }
      : null,
  ].filter(Boolean) as Array<{ no: string; title: string; total: number }>

  const grandTotal =
    parseAmount(formValues.packageOnePrice) +
    summaryRows.reduce((sum, row) => sum + row.total, 0)

  const handleExportPdf = async () => {
    if (!exportRef.current || isExporting) return

    try {
      setIsExporting(true)
      await document.fonts.ready

      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: exportRef.current.scrollWidth,
        height: exportRef.current.scrollHeight,
        windowWidth: exportRef.current.scrollWidth,
        windowHeight: exportRef.current.scrollHeight,
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imageWidth = pageWidth - PDF_PAGE_MARGIN_MM * 2
      const pageContentHeight = pageHeight - PDF_PAGE_MARGIN_MM * 2
      const pageCanvasHeight = Math.floor(
        (canvas.width * pageContentHeight) / imageWidth,
      )
      let offsetY = 0
      let pageIndex = 0

      while (offsetY < canvas.height) {
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - offsetY)
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = sliceHeight

        const context = pageCanvas.getContext('2d')

        if (!context) {
          throw new Error('Unable to create PDF export canvas context')
        }

        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        context.drawImage(
          canvas,
          0,
          offsetY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        )

        const pageImageHeight = (sliceHeight * imageWidth) / canvas.width

        if (pageIndex > 0) {
          pdf.addPage()
        }

        pdf.addImage(
          pageCanvas.toDataURL('image/png'),
          'PNG',
          PDF_PAGE_MARGIN_MM,
          PDF_PAGE_MARGIN_MM,
          imageWidth,
          pageImageHeight,
        )

        offsetY += sliceHeight
        pageIndex += 1
      }

      pdf.save(`invoice-${invoiceNumber || 'draft'}.pdf`)
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
        <Button component={RouterLink} to='/' variant='outlined'>
          Templates
        </Button>
        <Button
          component={RouterLink}
          to={`/package/${packageId}`}
          variant='outlined'
        >
          Back to Edit
        </Button>
        <Button variant='contained' onClick={handleExportPdf} disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export as PDF'}
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
          }}
        >
          <Box
            sx={{
              border: '1px solid #d9d9df',
              width: `${A4_WIDTH_PX}px`,
              margin: '0 auto',
              padding: '0.45in 0.4in 0.55in',
              background: '#ffffff',
              boxSizing: 'border-box',
              '@media print': {
                border: 'none',
                padding: '0.45in 0.4in 0.55in',
              },
            }}
          >
            <InvoiceDocumentContent
              formValues={formValues}
              invoiceNumber={invoiceNumber}
              packageSections={packageSections}
              preparedDate={preparedDate}
              summaryRows={summaryRows}
              grandTotal={grandTotal}
            />
          </Box>
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
        }}
      >
        <Box
          ref={exportRef}
          sx={{
            width: `${A4_WIDTH_PX}px`,
            background: '#ffffff',
            boxSizing: 'border-box',
            padding: '0.45in 0.4in 0.55in',
          }}
        >
          <InvoiceDocumentContent
            formValues={formValues}
            invoiceNumber={invoiceNumber}
            packageSections={packageSections}
            preparedDate={preparedDate}
            summaryRows={summaryRows}
            grandTotal={grandTotal}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default ReviewInvoice
