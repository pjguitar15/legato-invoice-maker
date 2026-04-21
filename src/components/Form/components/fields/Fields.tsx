import { Box } from '@mui/material'
import { styles } from '../formStyles'
import Field from './Field'
import { useInvoiceBuilder } from '../../../../context/useInvoiceBuilder'
import { EquipmentTypes } from '../list-checker/listCheckerProps'
import type { InvoiceFormValues } from '../../../../context/invoiceBuilderConfig'

type FieldConfig = {
  name: keyof InvoiceFormValues
  label: string
  type?: string
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
  {
    name: 'ledWallPrice',
    label: 'LED Wall Price',
    type: 'number',
  },
  {
    name: 'orFeePrice',
    label: 'OR Fee Price',
    type: 'number',
  },
  {
    name: 'transpoFeePrice',
    label: 'Transpo Fee Price',
    type: 'number',
  },
]

const Fields = () => {
  const { formValues, handleFieldChange, sections } = useInvoiceBuilder()
  const hasLedWallSelection = sections
    .find((section) => section.id === 7)
    ?.equipment.some((item) => item.type === EquipmentTypes.LED_WALL && item.isChecked)

  const visibleFieldConfig = fieldConfig.filter(
    (field) => field.name !== 'ledWallPrice' || hasLedWallSelection,
  )

  return (
    <Box sx={styles.root}>
      {visibleFieldConfig.map((field) => (
        <Field
          key={field.name}
          name={field.name}
          label={field.label}
          type={field.type}
          value={formValues[field.name as keyof typeof formValues]}
          onChange={handleFieldChange}
        />
      ))}
    </Box>
  )
}

export default Fields
