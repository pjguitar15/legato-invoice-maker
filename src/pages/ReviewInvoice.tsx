import { Box, Typography } from '@mui/material'
import { DEFAULT_BACKGROUND_COLOR } from '../mainStyleConst'
import legatoLogo from '../assets/legato-black.png' 

const ReviewInvoice = () => {
  // A4 = 595px x 832px
  const A4Style = {
    border: '1px solid lightgray',
    width: 595,
    height: 932,
    margin: 'auto',
    padding: '3rem 2rem',
    background: 'white',
  }
  return (
    <Box sx={{ background: DEFAULT_BACKGROUND_COLOR, padding: '1rem' }}>
      <Box sx={A4Style}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontFamily: 'Montserrat',
                  fontWeight: 700,
                }}
              >
                Legato Sounds and Lights
              </Typography>
              <Typography
                sx={{
                  fontSize: 10,
                  fontFamily: 'Montserrat',
                  fontWeight: 500
                }}
              >
                Block 27 lot 9, St. Joseph Homes, Brgy. Inocencio Trece Martires
                City, Cavite
              </Typography>
            </Box>
            <Box
              sx={{
                width: '13rem',
                height: 'auto',
                borderRadius: '50px',
                margin: '0px',
                padding: '0px',
              }}
              >
              <img style={{
                width: '100%',
                objectFit: 'cover'
              }} src={legatoLogo} alt='' />
            </Box>
          </Box>
          <Typography
            sx={{
              fontSize: 30,
            }}
            variant='h5'
          >
            Invoice
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
            }}
          >
            Invoice #21
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: 13 }}>
              Prepared for Name Here
            </Typography>
            <Typography sx={{ fontSize: 13 }}>Prepared date</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 9,
            }}
          >
            <Typography sx={{ fontSize: 13 }}>Event Venue: </Typography>
            <Typography sx={{ fontSize: 13 }}>Event Date: </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ReviewInvoice
