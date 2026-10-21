import { useEffect, useMemo, useState } from 'react'
import { Box, Button, InputAdornment, TextField, Typography } from '@mui/material'
import { Link as RouterLink, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
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
  const [searchParams] = useSearchParams()
  const isAcknowledgementReceipt =
    searchParams.get('documentType') === 'acknowledgement-receipt'
  const acknowledgementService = searchParams.get('service')
  const documentTypeQuery = isAcknowledgementReceipt
    ? `?documentType=acknowledgement-receipt${
        acknowledgementService
          ? `&service=${encodeURIComponent(acknowledgementService)}`
          : ''
      }`
    : ''
  const template = packageId ? getPackageTemplate(packageId) : undefined
  const isCustomPackage = packageId === CUSTOM_PACKAGE_ID
  const [showValidation, setShowValidation] = useState(false)
  const {
    activePackageId,
    formValues,
    sections,
    handleFieldChange,
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
      eventVenue: isAcknowledgementReceipt || formValues.eventVenue.trim()
        ? undefined
        : 'Event Venue is required',
      transpoFeePrice:
        !isAcknowledgementReceipt && hasTranspoFee && !formValues.transpoFeePrice.trim()
          ? 'Transpo Fee Price is required'
          : undefined,
    }
  }, [
    formValues.clientName,
    formValues.eventVenue,
    formValues.transpoFeePrice,
    isAcknowledgementReceipt,
    sections,
  ])

  const hasValidationErrors = Boolean(
    validationErrors.clientName ||
      validationErrors.eventVenue ||
      validationErrors.transpoFeePrice ||
      (isAcknowledgementReceipt && !formValues.packageOnePrice.trim()) ||
      (!isAcknowledgementReceipt && sections.some(
        (section) => section.isCustom && !(section.customPrice ?? '').trim(),
      )),
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
        : isAcknowledgementReceipt && !formValues.packageOnePrice.trim()
          ? 'packageOnePrice'
        : validationErrors.eventVenue
          ? 'eventVenue'
          : validationErrors.transpoFeePrice
            ? 'transpoFeePrice'
            : !isAcknowledgementReceipt && sections.some(
                  (section) => section.isCustom && !(section.customPrice ?? '').trim(),
                )
              ? 'customSectionPrice'
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

    navigate(`/package/${packageId}/review${documentTypeQuery}`)
  }

  if (!packageId || (!template && !isCustomPackage)) {
    return <Navigate to='/' replace />
  }

  return (
    <Box
      sx={{
        background: '#080b12',
        minHeight: '100vh',
        color: '#e8edf5',
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
            to={`/invoice-templates${documentTypeQuery}`}
            variant='text'
            startIcon={<FiArrowLeft />}
            sx={{
              padding: 0,
              minWidth: 0,
              marginBottom: '1rem',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'none',
              color: '#8a9ab5',
              '&:hover': {
                background: 'transparent',
                color: '#e8edf5',
              },
            }}
          >
            Back to templates
          </Button>
          <Box
            sx={{
              border: '1px solid #253147',
              borderRadius: '12px',
              background: '#111827',
              padding: { xs: '1.25rem', sm: '1.5rem 1.75rem' },
              boxShadow: '0 14px 40px rgba(0,0,0,0.18)',
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#93a4bf',
              }}
            >
              {isAcknowledgementReceipt ? 'Acknowledgement Receipt' : 'Package Template'}
            </Typography>
            <Typography
              component='h1'
              sx={{
                fontSize: { xs: 27, sm: 32 },
                lineHeight: 1.08,
                fontWeight: 800,
                color: '#e8edf5',
                marginTop: '0.55rem',
                letterSpacing: 0,
              }}
            >
              {isAcknowledgementReceipt
                ? acknowledgementService || 'Acknowledgement Receipt'
                : template?.name ?? 'Custom Invoice'}
            </Typography>
            <Typography
              sx={{
                maxWidth: 620,
                fontSize: 14.5,
                lineHeight: 1.65,
                color: '#aab7ca',
                marginTop: '0.75rem',
              }}
            >
              {isAcknowledgementReceipt
                ? 'Enter who the receipt is prepared for and the total amount received.'
                : template
                  ? 'Start from the preset equipment list, then refine details before reviewing the invoice.'
                  : 'Build the invoice from scratch, then review the final document before exporting.'}
            </Typography>
            {!isAcknowledgementReceipt ? <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: '1px',
                overflow: 'hidden',
                border: '1px solid #263244',
                borderRadius: '8px',
                background: '#263244',
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
                    background: '#111620',
                    padding: '0.75rem 0.85rem',
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#8a9ab5',
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
                      color: '#e8edf5',
                      marginTop: '0.25rem',
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box> : null}
          </Box>
        </Box>

        {isAcknowledgementReceipt ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1.5,
              marginTop: { xs: 1.5, sm: 2 },
              padding: { xs: '1.25rem', sm: '1.5rem' },
              border: '1px solid #253147',
              borderRadius: '12px',
              background: '#111827',
              boxShadow: '0 14px 40px rgba(0,0,0,0.16)',
              '& .MuiOutlinedInput-root': {
                minHeight: 54,
                background: '#0d1420',
                color: '#e8edf5',
                borderRadius: '9px',
                '& fieldset': {
                  borderColor: '#344158',
                },
                '&:hover fieldset': {
                  borderColor: '#71819b',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2dd4bf',
                  borderWidth: '1px',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#aab7ca',
                '&.Mui-focused': {
                  color: '#2dd4bf',
                },
              },
              '& .MuiInputAdornment-root': {
                color: '#93a4bf',
              },
              '& .MuiFormHelperText-root': {
                marginLeft: 0,
              },
            }}
          >
            <TextField
              name='clientName'
              label='Prepared for'
              placeholder='Client or organization'
              value={formValues.clientName}
              onChange={handleFieldChange}
              required
              error={Boolean(visibleValidationErrors?.clientName)}
              helperText={visibleValidationErrors?.clientName}
            />
            <TextField
              name='packageOnePrice'
              label='Total amount'
              placeholder='0.00'
              type='number'
              value={formValues.packageOnePrice}
              onChange={handleFieldChange}
              required
              error={showValidation && !formValues.packageOnePrice.trim()}
              helperText={showValidation && !formValues.packageOnePrice.trim() ? 'Total is required' : undefined}
              slotProps={{
                htmlInput: { min: 0, step: '0.01' },
                input: {
                  startAdornment: <InputAdornment position='start'>₱</InputAdornment>,
                },
              }}
            />
          </Box>
        ) : (
          <>
            <Fields errors={visibleValidationErrors} />
            <ListChecker showValidation={showValidation} />
          </>
        )}
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
              xs: 'rgba(8, 11, 18, 0.94)',
              sm: 'linear-gradient(rgba(8, 11, 18, 0.92), #080b12)',
            },
            borderTop: { xs: '1px solid #263244', sm: 'none' },
            backdropFilter: { xs: 'blur(10px)', sm: 'none' },
          }}
        >
          <Button
            component={RouterLink}
            to={`/invoice-templates${documentTypeQuery}`}
            variant='outlined'
            fullWidth
            sx={{
              borderColor: '#263244',
              color: '#c8d4e8',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '9px',
              minHeight: 50,
              '&:hover': {
                borderColor: '#71819b',
                background: '#111827',
              },
            }}
          >
            Change template
          </Button>
          <Button
            variant='contained'
            fullWidth
            onClick={handleReviewInvoice}
            sx={{
              background: '#2dd4bf',
              color: '#080b12',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '9px',
              minHeight: 50,
              boxShadow: 'none',
              '&:hover': {
                background: '#5eead4',
                boxShadow: 'none',
              },
            }}
          >
            {isAcknowledgementReceipt ? 'Review receipt' : 'Review invoice'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default CreateInvoice
