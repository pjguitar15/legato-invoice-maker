import { Box, Typography } from "@mui/material"
import List from "./List"
import type { EquipmentTypes, ListItemData } from "./listCheckerProps"
import { SAMPLE_OBJECT_ARRAY } from "./testData"
import { useCallback, useState } from "react"

const typeOrder: Record<EquipmentTypes, number> = {
  speaker: 0,
  mixer: 1,
  microphone: 2,
}

const sorted = SAMPLE_OBJECT_ARRAY.map((section) => ({
  ...section,
  equipment: [...section.equipment].sort(
    (a, b) => typeOrder[a.type] - typeOrder[b.type],
  ),
}))

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
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
} as const

const ListChecker = () => {
  const [data, setData] = useState([...sorted])

  const handleCheckClick = useCallback((sectionId: number, id: number) => {
    setData((current) =>
      current.map((section) => {
        if (section.id !== sectionId) return section

        return {
          ...section,
          equipment: section.equipment.map((item) =>
            item.id === id ? { ...item, isChecked: !item.isChecked } : item,
          ),
        }
      }),
    )
  }, [])

  return (
    <Box sx={styles.root}>
      {data?.map((item) => (
        <Box key={item.id}>
          <Typography sx={styles.heading}>{item.label}</Typography>

          <Box sx={styles.list}>
            {item.equipment.map(
              ({ id, isChecked, name, type }: ListItemData) => (
                <List
                  key={id}
                  sectionId={item.id}
                  id={id}
                  isChecked={isChecked}
                  name={name}
                  type={type}
                  handleCheckClick={handleCheckClick}
                />
              ),
            )}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default ListChecker
