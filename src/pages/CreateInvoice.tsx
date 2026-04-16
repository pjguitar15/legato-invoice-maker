import { Box, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import Fields from '../components/Form/components/fields/Fields'
import ListChecker from '../components/Form/components/list-checker/ListChecker'
import { DEFAULT_BACKGROUND_COLOR } from '../mainStyleConst'

const CreateInvoice = () => {
  return (
    <Box
      sx={{
        background: DEFAULT_BACKGROUND_COLOR,
      }}
    >
      <Box
        sx={{
          background: DEFAULT_BACKGROUND_COLOR,
          paddingBottom: '2rem',
          maxWidth: 500,
          margin: 'auto',
        }}
      >
        <Fields />
        <ListChecker />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '1.5rem',
          }}
        >
          <Button
            component={RouterLink}
            to='/review-invoice'
            variant='contained'
          >
            Review quotation
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default CreateInvoice
