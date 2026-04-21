import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
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
    background: '#ffffff',
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

const TemplateCard = ({
  template,
  onChoose,
}: {
  template: PackageTemplate
  onChoose: (packageId: string) => void
}) => (
  <Box
    onClick={() => onChoose(template.id)}
    sx={{
      position: 'relative',
      minHeight: { xs: '9.5rem', sm: '11rem' },
      borderRadius: '24px',
      overflow: 'hidden',
      cursor: 'pointer',
      backgroundImage: `linear-gradient(90deg, rgba(3, 5, 10, 0.92) 0%, rgba(3, 5, 10, 0.62) 48%, rgba(3, 5, 10, 0.75) 100%), url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 18px 50px rgba(9, 13, 20, 0.22)',
      transition: 'transform 180ms ease, box-shadow 180ms ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 24px 60px rgba(9, 13, 20, 0.28)',
      },
    }}
  >
    <Box
      sx={{
        alignSelf: 'flex-start',
        borderRadius: '999px',
        background: '#ffd31a',
        padding: '0.35rem 0.7rem',
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
        Template
      </Typography>
    </Box>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
      <Box>
        <Typography
          sx={{
            fontSize: { xs: 50, sm: 62 },
            lineHeight: 0.88,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.05em',
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
            color: '#ffd31a',
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

const PackageTemplateSelection = () => {
  const navigate = useNavigate()
  const { resetInvoiceBuilder, selectPackageTemplate } = useInvoiceBuilder()

  const handleChooseTemplate = (packageId: string) => {
    if (!selectPackageTemplate(packageId)) {
      return
    }

    navigate(`/package/${packageId}`)
  }

  const handleStartWithoutTemplate = () => {
    resetInvoiceBuilder()
    navigate(`/package/${CUSTOM_PACKAGE_ID}`)
  }

  return (
    <Box sx={styles.root}>
      <Box sx={styles.shell}>
        <Box sx={{ padding: '1rem 0 1.25rem' }}>
          <Typography
            sx={{
              fontSize: { xs: 30, sm: 36 },
              lineHeight: 1,
              fontWeight: 800,
              color: '#151821',
            }}
          >
            Select a template
          </Typography>
          <Typography
            onClick={handleStartWithoutTemplate}
            sx={{
              fontSize: 14,
              lineHeight: 1.4,
              fontWeight: 700,
              color: '#5f6b7b',
              marginTop: '0.65rem',
              display: 'inline-flex',
              cursor: 'pointer',
            }}
          >
            Create without template
          </Typography>
        </Box>

        <Box sx={styles.grid}>
          {packageTemplates.map((template) => (
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
