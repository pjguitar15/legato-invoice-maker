import { Box, FormControlLabel, Switch, Typography } from "@mui/material"
import List from "./List"
import { EquipmentTypes, type ListItemData } from "./listCheckerProps"
import { styles } from '../formStyles'
import { useInvoiceBuilder } from "../../../../context/useInvoiceBuilder"
import { SECTION_IDS, ITEM_IDS } from './testData'


const ListChecker = () => {
  const { sections, handleCheckClick } = useInvoiceBuilder()
  const visibleSections = sections.filter(
    (section) =>
      section.id !== SECTION_IDS.OFFICIAL_RECEIPT_FEE &&
      section.id !== SECTION_IDS.TRANSPORTATION_FEE &&
      section.id !== SECTION_IDS.LED_WALL_RISER,
  )
  const selectedLedWall = sections
    .find((section) => section.id === SECTION_IDS.LED_WALL)
    ?.equipment.find(({ isChecked, type }) => type === EquipmentTypes.LED_WALL && isChecked)
  const riserItem = sections.find(
    (section) => section.id === SECTION_IDS.LED_WALL_RISER,
  )?.equipment[0]
  const riserPrice =
    selectedLedWall?.id === ITEM_IDS.LED_WALL_9X14
      ? 20000
      : selectedLedWall?.id === ITEM_IDS.LED_WALL_9X12
        ? 18000
        : null

  return (
    <Box sx={styles.root}>
      {visibleSections.map((item) => (
        <Box
          key={item.id}
          sx={{
            margin: '0 1rem',
            padding: { xs: '1rem', sm: '1.1rem 1.2rem' },
            border: '1px solid #dfe3ea',
            borderRadius: '8px',
            background: '#ffffff',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.035)',
          }}
        >
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

          {item.id === SECTION_IDS.LED_WALL && selectedLedWall ? (
            <Box sx={{ marginTop: '0.6rem' }}>
              {riserItem && riserPrice ? (
                <Box
                  sx={{
                    marginTop: '0.75rem',
                    border: '1px solid #d8dce4',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem 0.65rem',
                    background: '#fbfcfd',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={riserItem.isChecked}
                        onChange={() =>
                          handleCheckClick(SECTION_IDS.LED_WALL_RISER, riserItem.id)
                        }
                      />
                    }
                    label='Include riser'
                    sx={{
                      margin: 0,
                      width: '100%',
                      justifyContent: 'space-between',
                      '& .MuiFormControlLabel-label': {
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#2f3746',
                      },
                    }}
                    labelPlacement='start'
                  />

                  {riserItem.isChecked ? (
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        lineHeight: 1.45,
                        color: '#667085',
                        marginTop: '0.2rem',
                        paddingRight: '0.25rem',
                      }}
                    >
                      {selectedLedWall.id === ITEM_IDS.LED_WALL_9X14
                        ? '9x14 ft LED wall base price is P18,000. With riser, it becomes P20,000.'
                        : '9x12 ft LED wall base price is P15,000. Add P3,000 when riser is included.'}
                    </Typography>
                  ) : null}
                </Box>
              ) : null}
            </Box>
          ) : null}
        </Box>
      ))}
    </Box>
  )
}

export default ListChecker
