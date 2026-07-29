import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router'
import { FiArrowLeft } from 'react-icons/fi'
import heroImage from '../assets/hero.png'
import {
  CUSTOM_PACKAGE_ID,
  packageTemplates,
  type PackageTemplate,
} from '../context/invoiceBuilderConfig'
import { useInvoiceBuilder } from '../context/useInvoiceBuilder'

const styles = {
  root: {
    minHeight: '100vh',
    background: '#080b12',
    padding: '1rem',
  },
  shell: {
    maxWidth: '420px',
    margin: '0 auto',
    '@media (min-width: 900px)': {
      maxWidth: '960px',
    },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.9rem',
    '@media (min-width: 900px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '1.25rem',
    },
  },
} as const

const isFullBandTemplate = (template: PackageTemplate) =>
  template.id.includes('full-band')

const TemplateCard = ({
  template,
  onChoose,
}: {
  template: PackageTemplate
  onChoose: (packageId: string) => void
}) => {
  const isFullBand = isFullBandTemplate(template)

  return (
    <Box
      onClick={() => onChoose(template.id)}
      sx={{
        position: 'relative',
        minHeight: { xs: '9.5rem', sm: '11rem' },
        borderRadius: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundImage: isFullBand
          ? `linear-gradient(125deg, rgba(13, 5, 11, 0.96) 0%, rgba(53, 12, 21, 0.84) 45%, rgba(7, 11, 24, 0.82) 100%), url(${heroImage})`
          : `linear-gradient(90deg, rgba(3, 5, 10, 0.92) 0%, rgba(3, 5, 10, 0.62) 48%, rgba(3, 5, 10, 0.75) 100%), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: isFullBand
          ? '1px solid rgba(255, 192, 92, 0.24)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isFullBand
          ? '0 24px 60px rgba(36, 8, 14, 0.28)'
          : '0 18px 50px rgba(9, 13, 20, 0.22)',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&::before': isFullBand
          ? {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(135deg, transparent 0%, transparent 52%, rgba(255, 210, 112, 0.14) 52%, rgba(255, 210, 112, 0.14) 58%, transparent 58%, transparent 100%)',
              pointerEvents: 'none',
            }
          : undefined,
        '&::after': isFullBand
          ? {
              content: '""',
              position: 'absolute',
              right: '-1.6rem',
              top: '-1.6rem',
              width: '6rem',
              height: '6rem',
              borderRadius: '999px',
              background:
                'radial-gradient(circle, rgba(255, 192, 92, 0.46) 0%, rgba(255, 192, 92, 0) 72%)',
              pointerEvents: 'none',
            }
          : undefined,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isFullBand
            ? '0 28px 70px rgba(36, 8, 14, 0.34)'
            : '0 24px 60px rgba(9, 13, 20, 0.28)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          alignSelf: 'flex-start',
          borderRadius: '999px',
          background: isFullBand
            ? 'linear-gradient(135deg, #ffe07d 0%, #ffb11b 100%)'
            : '#ffd31a',
          padding: '0.35rem 0.7rem',
          boxShadow: isFullBand ? '0 10px 22px rgba(255, 177, 27, 0.2)' : 'none',
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            lineHeight: 1,
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#131821',
            letterSpacing: '0.04em',
          }}
        >
          {isFullBand ? 'Full Band' : 'Template'}
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 50, sm: 62 },
              lineHeight: 0.88,
              fontWeight: 800,
              color: isFullBand ? '#ffe07d' : '#ffffff',
              letterSpacing: '-0.05em',
              textShadow: isFullBand ? '0 8px 22px rgba(255, 177, 27, 0.16)' : 'none',
            }}
          >
            {template.cardPrice}
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              lineHeight: 1,
              fontWeight: 800,
              color: '#ffffff',
              textTransform: 'uppercase',
              marginTop: '0.1rem',
            }}
          >
            only
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right', alignSelf: 'flex-end' }}>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 20 },
              lineHeight: 1.1,
              fontWeight: 800,
              color: '#ffffff',
              textTransform: 'uppercase',
            }}
          >
            {template.heroTitle}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 14, sm: 15 },
              lineHeight: 1.2,
              fontWeight: 700,
              color: isFullBand ? '#ffe07d' : '#ffd31a',
              textTransform: 'uppercase',
              marginTop: '0.3rem',
            }}
          >
            {template.heroAccent}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

const PackageTemplateSelection = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAcknowledgementReceipt = searchParams.get('documentType') === 'acknowledgement-receipt'
  const documentTypeQuery = isAcknowledgementReceipt
    ? '?documentType=acknowledgement-receipt'
    : ''
  const { resetInvoiceBuilder, selectPackageTemplate } = useInvoiceBuilder()
  const acknowledgementTemplates = [
    'Sounds and Lights',
    'Sound System',
    'LED Wall with Sounds and Lights',
    'Church Consultation',
  ] as const

  const handleChooseTemplate = (packageId: string) => {
    if (!selectPackageTemplate(packageId)) {
      return
    }

    navigate(`/package/${packageId}${documentTypeQuery}`)
  }

  const handleStartWithoutTemplate = () => {
    resetInvoiceBuilder()
    navigate(`/package/${CUSTOM_PACKAGE_ID}${documentTypeQuery}`)
  }

  const handleChooseAcknowledgementTemplate = (service: string) => {
    resetInvoiceBuilder()
    navigate(
      `/package/${CUSTOM_PACKAGE_ID}?documentType=acknowledgement-receipt&service=${encodeURIComponent(service)}`,
    )
  }

  return (
    <Box sx={styles.root}>
      <Box sx={styles.shell}>
        <Box sx={{ padding: '1rem 0 1.25rem' }}>
          <Button
            component={RouterLink}
            to='/'
            variant='text'
            startIcon={<FiArrowLeft />}
            sx={{
              padding: 0,
              minWidth: 0,
              marginBottom: '1rem',
              fontSize: 13,
              fontWeight: 800,
              color: '#8a9ab5',
              textTransform: 'none',
              '&:hover': {
                background: 'transparent',
                color: '#e8edf5',
              },
            }}
          >
            Business manager
          </Button>
          <Typography
            sx={{
              fontSize: { xs: 30, sm: 36 },
              lineHeight: 1,
              fontWeight: 800,
              color: '#e8edf5',
            }}
          >
            {isAcknowledgementReceipt
              ? 'Select a receipt type'
              : 'Select a template'}
          </Typography>
          {!isAcknowledgementReceipt ? (
            <Typography
              onClick={handleStartWithoutTemplate}
              sx={{
                fontSize: 14,
                lineHeight: 1.4,
                fontWeight: 700,
                color: '#8a9ab5',
                marginTop: '0.65rem',
                display: 'inline-flex',
                cursor: 'pointer',
              }}
            >
              Create without template
            </Typography>
          ) : null}
        </Box>

        <Box sx={styles.grid}>
          {isAcknowledgementReceipt
            ? acknowledgementTemplates.map((service) => (
                <Button
                  key={service}
                  variant='outlined'
                  onClick={() => handleChooseAcknowledgementTemplate(service)}
                  sx={{
                    minHeight: 112,
                    justifyContent: 'flex-start',
                    padding: '1.25rem',
                    borderColor: '#263244',
                    background: '#111827',
                    color: '#e8edf5',
                    borderRadius: '8px',
                    fontSize: 17,
                    fontWeight: 800,
                    textAlign: 'left',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#2dd4bf',
                      background: '#151e2d',
                    },
                  }}
                >
                  {service}
                </Button>
              ))
            : packageTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onChoose={handleChooseTemplate}
                />
              ))}
        </Box>
      </Box>
    </Box>
  )
}

export default PackageTemplateSelection
