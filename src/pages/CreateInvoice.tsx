import { useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink, Navigate, useParams } from 'react-router'
import Fields from '../components/Form/components/fields/Fields'
import ListChecker from '../components/Form/components/list-checker/ListChecker'
import { DEFAULT_BACKGROUND_COLOR } from '../mainStyleConst'
import {
  CUSTOM_PACKAGE_ID,
  getPackageTemplate,
} from '../context/invoiceBuilderConfig'
import { useInvoiceBuilder } from '../context/useInvoiceBuilder'

const CreateInvoice = () => {
  const { packageId } = useParams()
  const template = packageId ? getPackageTemplate(packageId) : undefined
  const isCustomPackage = packageId === CUSTOM_PACKAGE_ID
  const { activePackageId, resetInvoiceBuilder, selectPackageTemplate } =
    useInvoiceBuilder()

  useEffect(() => {
    if (isCustomPackage) {
      if (activePackageId !== CUSTOM_PACKAGE_ID) {
        resetInvoiceBuilder()
      }

      return
    }

    if (!packageId || !template || activePackageId === packageId) {
      return
    }

    selectPackageTemplate(packageId)
  }, [
    activePackageId,
    isCustomPackage,
    packageId,
    resetInvoiceBuilder,
    selectPackageTemplate,
    template,
  ])

  if (!packageId || (!template && !isCustomPackage)) {
    return <Navigate to='/' replace />
  }

  return (
    <Box
      sx={{
        background: DEFAULT_BACKGROUND_COLOR,
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          background: DEFAULT_BACKGROUND_COLOR,
          padding: '1.25rem 0 2rem',
          maxWidth: 500,
          margin: 'auto',
        }}
      >
        <Box
          sx={{
            padding: '0 1rem 1.5rem',
          }}
        >
          <Button
            component={RouterLink}
            to='/'
            variant='text'
            sx={{
              padding: 0,
              minWidth: 0,
              marginBottom: '0.75rem',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Back to templates
          </Button>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#7b8190',
            }}
          >
            Package Template
          </Typography>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 800,
              color: '#171c26',
              marginTop: '0.35rem',
            }}
          >
            {template?.name ?? 'Custom Invoice'}
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              lineHeight: 1.6,
              color: '#5e6573',
              marginTop: '0.45rem',
            }}
          >
            {template
              ? 'This package starts with preset equipment selections. You can remove or add items before reviewing the invoice.'
              : 'Build the invoice from scratch. You can add or remove any equipment before reviewing the invoice.'}
          </Typography>
        </Box>

        <Fields />
        <ListChecker />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'stretch',
            paddingTop: '1.5rem',
            gap: '0.75rem',
            paddingX: '1rem',
          }}
        >
          <Button component={RouterLink} to='/' variant='outlined' fullWidth>
            Change template
          </Button>
          <Button
            component={RouterLink}
            to={`/package/${packageId}/review`}
            variant='contained'
            fullWidth
          >
            Review invoice
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default CreateInvoice
