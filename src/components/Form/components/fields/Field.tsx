import { Box, TextField, Typography } from '@mui/material'
import { styles } from '../formStyles'
import type { ChangeEvent } from 'react'

type FieldProps = {
  name: string
  label: string
  placeholder: string
  type?: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const Field = ({
  name,
  label,
  placeholder,
  type,
  value,
  onChange,
}: FieldProps) => {
  return (
    <Box>
      <Typography sx={styles.heading}>{label}</Typography>

      <Box sx={styles.fieldContainer}>
        <TextField
          sx={styles.field}
          name={name}
          label={placeholder}
          type={type}
          value={value}
          onChange={onChange}
          slotProps={
            type === 'date'
              ? {
                  inputLabel: { shrink: true },
                }
              : undefined
          }
          fullWidth
        />
      </Box>
    </Box>
  )
}

export default Field
