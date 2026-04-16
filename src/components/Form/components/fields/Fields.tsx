import { Box } from '@mui/material'
import { styles } from '../formStyles'
import Field from './Field'
import { useInvoiceBuilder } from '../../../../context/InvoiceBuilderContext'

type FieldConfig = {
  name: string
  label: string
  placeholder: string
  type?: string
}

const fieldConfig: FieldConfig[] = [
  {
    name: 'invoiceNumber',
    label: 'Quote Number',
    placeholder: 'Enter quote number',
  },
  {
    name: 'clientName',
    label: 'Prepared For',
    placeholder: 'Enter client name',
  },
  {
    name: 'eventVenue',
    label: 'Event Venue',
    placeholder: 'Enter event venue',
  },
  {
    name: 'preparedBy',
    label: 'Prepared By',
    placeholder: 'Enter preparer name',
  },
  {
    name: 'preparedDate',
    label: 'Prepared Date',
    placeholder: 'Select prepared date',
    type: 'date',
  },
  {
    name: 'eventDate',
    label: 'Event Date',
    placeholder: 'Select event date',
    type: 'date',
  },
  {
    name: 'packageOnePrice',
    label: 'Package 01 Total',
    placeholder: 'Enter total amount',
    type: 'number',
  },
  {
    name: 'ledWallPrice',
    label: 'LED Wall Price',
    placeholder: 'Enter LED wall amount',
    type: 'number',
  },
  {
    name: 'orFeePrice',
    label: 'OR Fee Price',
    placeholder: 'Enter OR fee amount',
    type: 'number',
  },
  {
    name: 'transpoFeePrice',
    label: 'Transpo Fee Price',
    placeholder: 'Enter transpo fee amount',
    type: 'number',
  },
]

const Fields = () => {
  const { formValues, handleFieldChange } = useInvoiceBuilder()

  return (
    <Box sx={styles.root}>
      {fieldConfig.map((field) => (
        <Field
          key={field.name}
          name={field.name}
          label={field.label}
          placeholder={field.placeholder}
          type={field.type}
          value={formValues[field.name as keyof typeof formValues]}
          onChange={handleFieldChange}
        />
      ))}
    </Box>
  )
}

export default Fields
