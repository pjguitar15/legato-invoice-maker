import { Box, TextField } from '@mui/material'
import { styles } from '../formStyles'
import type { ChangeEvent } from 'react'

type FieldProps = {
  name: string
  label: string
  type?: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helperText?: string
}

const Field = ({
  name,
  label,
  type,
  value,
  onChange,
  error,
  helperText,
}: FieldProps) => {
  return (
    <Box>
      <Box sx={styles.fieldContainer}>
        <TextField
          sx={styles.field}
          name={name}
          label={label}
          type={type}
          value={value}
          onChange={onChange}
          error={error}
          helperText={helperText}
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
