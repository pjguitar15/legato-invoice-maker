import { DEFAULT_BACKGROUND_COLOR } from "../../../mainStyleConst";

export const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    background: DEFAULT_BACKGROUND_COLOR,
    padding: '16px 0',
  },
  heading: {
    textTransform: 'uppercase',
    fontSize: '12px',
    letterSpacing: '0.03em',
    padding: '0px 1rem',
    marginBottom: '10px',
    fontFamily: 'Montserrat',
    fontWeight: 500,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldContainer: {
    padding: '0px 12px'
  },
  field: {
    background: '#ffffff',
    width: '100%'
  }
} as const
