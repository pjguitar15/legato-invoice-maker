import { Box, Typography } from "@mui/material"
import List from "./List"
import Field from '../fields/Field'
import { EquipmentTypes, type ListItemData } from "./listCheckerProps"
import { styles } from '../formStyles'
import { useInvoiceBuilder } from "../../../../context/useInvoiceBuilder"


const ListChecker = () => {
  const { formValues, sections, handleCheckClick, handleFieldChange } =
    useInvoiceBuilder()
  const visibleSections = sections.filter(
    (section) => section.id !== 8 && section.id !== 9,
  )

  return (
    <Box sx={styles.root}>
      {visibleSections.map((item) => (
        <Box key={item.id} sx={{ padding: '0 12px' }}>
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

          {item.id === 7 &&
          item.equipment.some(
            ({ isChecked, type }) =>
              type === EquipmentTypes.LED_WALL && isChecked,
          ) ? (
            <Box sx={{ marginTop: '0.6rem' }}>
              <Field
                name='ledWallPrice'
                label='LED Wall Price'
                type='number'
                value={formValues.ledWallPrice}
                onChange={handleFieldChange}
              />
            </Box>
          ) : null}
        </Box>
      ))}
    </Box>
  )
}

export default ListChecker
