export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0.75rem 0 0',
  },
  heading: {
    textTransform: 'uppercase',
    fontSize: '11px',
    letterSpacing: '0.08em',
    padding: 0,
    marginBottom: '0.7rem',
    fontFamily: 'Montserrat',
    fontWeight: 800,
    color: '#667085',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    border: '1px solid #e2e6ee',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#e2e6ee',
  },
  fieldContainer: {
    padding: '0 1rem',
  },
  field: {
    background: '#ffffff',
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      fontWeight: 600,
      color: '#242b38',
      '& fieldset': {
        borderColor: '#d8dde7',
      },
      '&:hover fieldset': {
        borderColor: '#aeb7c6',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#171c26',
        borderWidth: '1px',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#667085',
      fontWeight: 700,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#171c26',
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      fontWeight: 700,
    },
  }
} as const
