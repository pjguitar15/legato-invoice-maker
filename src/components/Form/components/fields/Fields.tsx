import { Box, FormControlLabel, Switch, Typography } from '@mui/material'
import { styles } from '../formStyles'
import Field from './Field'
import { useInvoiceBuilder } from '../../../../context/useInvoiceBuilder'
import type { InvoiceFormValues } from '../../../../context/invoiceBuilderConfig'

type FieldConfig = {
  name: keyof InvoiceFormValues
  label: string
  type?: string
}

type FieldsProps = {
  errors?: Partial<Record<keyof InvoiceFormValues, string>>
}

const fieldConfig: FieldConfig[] = [
  {
    name: 'clientName',
    label: 'Prepared For',
  },
  {
    name: 'eventVenue',
    label: 'Event Venue',
  },
  {
    name: 'eventDate',
    label: 'Event Date',
    type: 'date',
  },
  {
    name: 'packageOnePrice',
    label: 'Package 01 Total',
    type: 'number',
  },
]

const Fields = ({ errors }: FieldsProps) => {
  const { formValues, handleFieldChange, handleCheckClick, sections } =
    useInvoiceBuilder()
  const orFeeItem = sections.find((section) => section.id === 8)?.equipment[0]
  const transpoFeeItem = sections.find((section) => section.id === 9)?.equipment[0]

  return (
    <Box sx={styles.root}>
      {fieldConfig.map((field) => (
        <Field
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type}
          value={formValues[field.name as keyof typeof formValues]}
          onChange={handleFieldChange}
          error={Boolean(errors?.[field.name])}
          helperText={errors?.[field.name]}
        />
      ))}

      {orFeeItem ? (
        <Box sx={styles.fieldContainer}>
          <Box
            sx={{
              border: '1px solid #d8dce4',
              borderRadius: '12px',
              padding: '0.5rem 0.75rem 0.65rem',
              background: '#ffffff',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={orFeeItem.isChecked}
                  onChange={() => handleCheckClick(8, orFeeItem.id)}
                />
              }
              label='Include OR fee'
              sx={{
                margin: 0,
                width: '100%',
                justifyContent: 'space-between',
                '& .MuiFormControlLabel-label': {
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#2f3746',
                },
              }}
              labelPlacement='start'
            />

            {orFeeItem.isChecked ? (
              <Typography
                sx={{
                  fontSize: 12.5,
                  lineHeight: 1.45,
                  color: '#667085',
                  marginTop: '0.2rem',
                  paddingRight: '0.25rem',
                }}
              >
                12% of the total will be added, then rounded up. Examples:
                P3,878 becomes P4,000, P2,439 becomes P2,500, and P4,224
                becomes P4,500.
              </Typography>
            ) : null}
          </Box>
        </Box>
      ) : null}

      {transpoFeeItem ? (
        <Box sx={styles.fieldContainer}>
          <Box
            sx={{
              border: '1px solid #d8dce4',
              borderRadius: '12px',
              padding: '0.5rem 0.75rem 0.75rem',
              background: '#ffffff',
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={transpoFeeItem.isChecked}
                  onChange={() => handleCheckClick(9, transpoFeeItem.id)}
                />
              }
              label='Include transpo fee'
              sx={{
                margin: 0,
                width: '100%',
                justifyContent: 'space-between',
                '& .MuiFormControlLabel-label': {
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#2f3746',
                },
              }}
              labelPlacement='start'
            />

            {transpoFeeItem.isChecked ? (
              <Box sx={{ marginTop: '0.4rem' }}>
                <Field
                  name='transpoFeePrice'
                  label='Transpo Fee Price'
                  type='number'
                  value={formValues.transpoFeePrice}
                  onChange={handleFieldChange}
                  error={Boolean(errors?.transpoFeePrice)}
                  helperText={errors?.transpoFeePrice}
                />
              </Box>
            ) : null}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}

export default Fields
