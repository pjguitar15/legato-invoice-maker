import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink, Navigate, useNavigate, useParams } from 'react-router'
import { FiArrowLeft } from 'react-icons/fi'
import Fields from '../components/Form/components/fields/Fields'
import ListChecker from '../components/Form/components/list-checker/ListChecker'
import {
  CUSTOM_PACKAGE_ID,
  type InvoiceFormValues,
  getPackageTemplate,
} from '../context/invoiceBuilderConfig'
import { useInvoiceBuilder } from '../context/useInvoiceBuilder'
import { SECTION_IDS } from '../components/Form/components/list-checker/testData'

const CreateInvoice = () => {
  const { packageId } = useParams()
  const navigate = useNavigate()
  const template = packageId ? getPackageTemplate(packageId) : undefined
  const isCustomPackage = packageId === CUSTOM_PACKAGE_ID
  const [showValidation, setShowValidation] = useState(false)
  const {
    activePackageId,
    formValues,
    sections,
    resetInvoiceBuilder,
    selectPackageTemplate,
  } = useInvoiceBuilder()

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

  const validationErrors = useMemo<
    Partial<Record<keyof InvoiceFormValues, string>>
  >(() => {
    const hasTranspoFee = Boolean(
      sections.find(
        (section) => section.id === SECTION_IDS.TRANSPORTATION_FEE,
      )?.equipment[0]?.isChecked,
    )

    return {
      clientName: formValues.clientName.trim()
        ? undefined
        : 'Prepared For is required',
      eventVenue: formValues.eventVenue.trim()
        ? undefined
        : 'Event Venue is required',
      transpoFeePrice:
        hasTranspoFee && !formValues.transpoFeePrice.trim()
          ? 'Transpo Fee Price is required'
          : undefined,
    }
  }, [
    formValues.clientName,
    formValues.eventVenue,
    formValues.transpoFeePrice,
    sections,
  ])

  const hasValidationErrors = Boolean(
    validationErrors.clientName ||
      validationErrors.eventVenue ||
      validationErrors.transpoFeePrice,
  )

  const visibleValidationErrors = showValidation ? validationErrors : undefined
  const selectedEquipmentCount = sections.reduce(
    (count, section) =>
      count + section.equipment.filter((item) => item.isChecked).length,
    0,
  )

  const handleReviewInvoice = () => {
    if (hasValidationErrors) {
      setShowValidation(true)

      const firstInvalidFieldName = validationErrors.clientName
        ? 'clientName'
        : validationErrors.eventVenue
          ? 'eventVenue'
          : validationErrors.transpoFeePrice
            ? 'transpoFeePrice'
          : null

      if (firstInvalidFieldName) {
        requestAnimationFrame(() => {
          const field = document.querySelector<HTMLInputElement>(
            `input[name="${firstInvalidFieldName}"]`,
          )

          field?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          field?.focus()
        })
      }

      return
    }

    navigate(`/package/${packageId}/review`)
  }

  if (!packageId || (!template && !isCustomPackage)) {
    return <Navigate to='/' replace />
  }

  return (
    <Box
      sx={{
        background: '#f6f7f9',
        minHeight: '100vh',
        color: '#171c26',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 760,
          margin: 'auto',
          padding: { xs: '1rem 0 6.75rem', sm: '1.5rem 1rem 2rem' },
        }}
      >
        <Box
          sx={{
            padding: { xs: '0 1rem 1.25rem', sm: 0 },
          }}
        >
          <Button
            component={RouterLink}
            to='/invoice-templates'
            variant='text'
            startIcon={<FiArrowLeft />}
            sx={{
              padding: 0,
              minWidth: 0,
              marginBottom: '1rem',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'none',
              color: '#4f5b6d',
              '&:hover': {
                background: 'transparent',
                color: '#171c26',
              },
            }}
          >
            Back to templates
          </Button>
          <Box
            sx={{
              border: '1px solid #dfe3ea',
              borderRadius: '8px',
              background: '#ffffff',
              padding: { xs: '1.1rem', sm: '1.35rem 1.5rem' },
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#7b8190',
              }}
            >
              Package Template
            </Typography>
            <Typography
              component='h1'
              sx={{
                fontSize: { xs: 28, sm: 34 },
                lineHeight: 1.08,
                fontWeight: 800,
                color: '#151922',
                marginTop: '0.45rem',
                letterSpacing: 0,
              }}
            >
              {template?.name ?? 'Custom Invoice'}
            </Typography>
            <Typography
              sx={{
                maxWidth: 620,
                fontSize: 14.5,
                lineHeight: 1.65,
                color: '#5e6573',
                marginTop: '0.65rem',
              }}
            >
              {template
                ? 'Start from the preset equipment list, then refine details before reviewing the invoice.'
                : 'Build the invoice from scratch, then review the final document before exporting.'}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: '1px',
                overflow: 'hidden',
                border: '1px solid #e6e9ef',
                borderRadius: '8px',
                background: '#e6e9ef',
                marginTop: '1.1rem',
              }}
            >
              {[
                ['Selected items', selectedEquipmentCount],
                ['Client', formValues.clientName || 'Required'],
                ['Venue', formValues.eventVenue || 'Required'],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    background: '#fbfcfd',
                    padding: '0.75rem 0.85rem',
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#7b8190',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#242b38',
                      marginTop: '0.25rem',
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Fields errors={visibleValidationErrors} />
        <ListChecker />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            alignItems: 'stretch',
            position: { xs: 'fixed', sm: 'sticky' },
            left: { xs: 0, sm: 'auto' },
            right: { xs: 0, sm: 'auto' },
            bottom: 0,
            zIndex: 5,
            padding: { xs: '0.85rem 1rem', sm: '1rem 0 0' },
            gap: '0.75rem',
            background: {
              xs: 'rgba(246, 247, 249, 0.94)',
              sm: 'linear-gradient(rgba(246, 247, 249, 0.92), #f6f7f9)',
            },
            borderTop: { xs: '1px solid #dfe3ea', sm: 'none' },
            backdropFilter: { xs: 'blur(10px)', sm: 'none' },
          }}
        >
          <Button
            component={RouterLink}
            to='/invoice-templates'
            variant='outlined'
            fullWidth
            sx={{
              borderColor: '#ccd3dd',
              color: '#344054',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '8px',
              minHeight: 46,
            }}
          >
            Change template
          </Button>
          <Button
            variant='contained'
            fullWidth
            onClick={handleReviewInvoice}
            sx={{
              background: '#171c26',
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '8px',
              minHeight: 46,
              boxShadow: 'none',
              '&:hover': {
                background: '#2a3140',
                boxShadow: 'none',
              },
            }}
          >
            Review invoice
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default CreateInvoice
