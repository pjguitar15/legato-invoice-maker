import { Box, Typography } from '@mui/material'
import { FaCheckSquare, FaRegSquare } from 'react-icons/fa'
import { equipmentIcons, type ListProps } from './listCheckerProps'
import { memo } from 'react'

const styles = {
  row: {
    background: '#161b25',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1rem',
    transition: 'background-color 160ms ease',
    '&:hover': {
      background: '#1d2535',
    },
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.1,
    minWidth: 0,
    color: '#8a9ab5',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat',
    fontWeight: 650,
    lineHeight: 1.35,
    color: '#c8d4e8',
  },
  action: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '8px',
    color: '#2dd4bf',
    padding: '0.2rem',
    marginLeft: '0.75rem',
  },
} as const

const List = memo((props: ListProps) => {
  const { sectionId, id, isChecked, name, type, handleCheckClick } = props
  const Icon = equipmentIcons[type]

  return (
    <Box sx={styles.row}>
      <Box sx={styles.content}>
        <Icon size={20} />
        <Typography sx={styles.label}>{name}</Typography>
      </Box>
      <Box onClick={() => handleCheckClick(sectionId, id)} sx={styles.action}>
        {isChecked ? <FaCheckSquare size={21} /> : <FaRegSquare size={21} />}
      </Box>
    </Box>
  )
})

export default List
