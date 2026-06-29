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
    color: '#8a9ab5',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    border: '1px solid #263244',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#263244',
  },
  fieldContainer: {
    padding: '0 1rem',
  },
  field: {
    background: '#111620',
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      fontWeight: 600,
      color: '#e8edf5',
      '& fieldset': {
        borderColor: '#263244',
      },
      '&:hover fieldset': {
        borderColor: '#3d5068',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2dd4bf',
        borderWidth: '1px',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#8a9ab5',
      fontWeight: 700,
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#2dd4bf',
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      fontWeight: 700,
    },
    '& input': {
      colorScheme: 'dark',
    },
  }
} as const
