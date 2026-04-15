import { Box, Typography } from '@mui/material'
import { FaCheckSquare, FaRegSquare } from 'react-icons/fa'
import { equipmentIcons, type ListProps } from './listCheckerProps'
import { memo } from 'react'

const styles = {
  row: {
    background: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 1.2rem',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat',
    fontWeight: 500,
  },
  action: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    gap: '8px',
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
