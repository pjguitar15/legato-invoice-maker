import { Box, Typography } from "@mui/material"
import List from "./List"
import type { ListItemData } from "./listCheckerProps"
import { styles } from '../formStyles'
import { useInvoiceBuilder } from "../../../../context/useInvoiceBuilder"


const ListChecker = () => {
  const { sections, handleCheckClick } = useInvoiceBuilder()

  return (
    <Box sx={styles.root}>
      {sections.map((item) => (
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
