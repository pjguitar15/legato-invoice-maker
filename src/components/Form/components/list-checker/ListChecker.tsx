import { useState } from 'react'
import { Box, Button, FormControlLabel, IconButton, InputAdornment, Switch, TextField, Typography } from '@mui/material'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import List from "./List"
import { EquipmentTypes, type ListItemData } from "./listCheckerProps"
import { styles } from '../formStyles'
import { useInvoiceBuilder } from "../../../../context/useInvoiceBuilder"
import { SECTION_IDS, ITEM_IDS } from './testData'


const ListChecker = ({ showValidation = false }: { showValidation?: boolean }) => {
  const {
    sections,
    handleCheckClick,
    addCustomSection,
    removeCustomSection,
    addCustomItem,
    removeCustomItem,
    updateCustomSectionPrice,
  } = useInvoiceBuilder()
  const [customItemName, setCustomItemName] = useState('')
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
            padding: { xs: '1rem', sm: item.isCustom ? '1.25rem' : '1.1rem 1.2rem' },
            border: item.isCustom ? '1px solid #34445c' : '1px solid #263244',
            borderLeft: item.isCustom ? '3px solid #2dd4bf' : undefined,
            borderRadius: '10px',
            background: '#161b25',
            boxShadow: item.isCustom ? '0 10px 30px rgba(0, 0, 0, 0.14)' : 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box>
              <Typography sx={{ ...styles.heading, mb: item.isCustom ? 0.25 : '0.7rem' }}>
                {item.label}
              </Typography>
              {item.isCustom ? (
                <Typography sx={{ fontSize: 12.5, color: '#8a9ab5' }}>
                  Add the section price, then list every included extra.
                </Typography>
              ) : null}
            </Box>
            {item.isCustom ? (
              <IconButton
                aria-label='Remove extras section'
                onClick={() => removeCustomSection(item.id)}
                size='small'
                sx={{ color: '#f87171' }}
              >
                <FiTrash2 size={17} />
              </IconButton>
            ) : null}
          </Box>

          {item.isCustom ? (
            <Box
              sx={{
                display: 'grid',
                gap: 1.25,
                mt: 2,
                p: { xs: 1.25, sm: 1.5 },
                border: '1px solid #263244',
                borderRadius: '8px',
                background: '#111620',
              }}
            >
              <TextField
                name='customSectionPrice'
                value={item.customPrice ?? ''}
                onChange={(event) => updateCustomSectionPrice(item.id, event.target.value)}
                label='Extras / Reinforcements price'
                type='number'
                required
                error={showValidation && !(item.customPrice ?? '').trim()}
                helperText={
                  showValidation && !(item.customPrice ?? '').trim()
                    ? 'Extras / Reinforcements price is required'
                    : undefined
                }
                slotProps={{
                  htmlInput: { min: 0 },
                  input: {
                    startAdornment: <InputAdornment position='start'>₱</InputAdornment>,
                  },
                }}
                sx={styles.field}
                fullWidth
              />
              <Box
                component='form'
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!customItemName.trim()) return
                  addCustomItem(item.id, customItemName)
                  setCustomItemName('')
                }}
                sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}
              >
                <TextField
                  value={customItemName}
                  onChange={(event) => setCustomItemName(event.target.value)}
                  label='Extra or reinforcement item'
                  placeholder='e.g. 2 additional crew members'
                  size='small'
                  sx={styles.field}
                  fullWidth
                />
                <Button
                  type='submit'
                  variant='contained'
                  startIcon={<FiPlus />}
                  disabled={!customItemName.trim()}
                  sx={{ whiteSpace: 'nowrap', minWidth: 130 }}
                >
                  Add item
                </Button>
              </Box>
            </Box>
          ) : null}

          <Box sx={{ ...styles.list, mt: item.isCustom ? 1.25 : 0 }}>
            {item.isCustom && item.equipment.length === 0 ? (
              <Typography sx={{ p: 2, textAlign: 'center', fontSize: 13, color: '#8a9ab5', background: '#111620' }}>
                No extras added yet.
              </Typography>
            ) : null}
            {item.equipment.map(
              ({ id, isChecked, name, type }: ListItemData) => (
                <Box
                  key={id}
                  sx={{
                    position: 'relative',
                    ...(item.isCustom ? { '& > div': { paddingRight: '3.25rem' } } : {}),
                  }}
                >
                  <List
                    sectionId={item.id}
                    id={id}
                    isChecked={isChecked}
                    name={name}
                    type={type}
                    handleCheckClick={handleCheckClick}
                  />
                  {item.isCustom ? (
                    <IconButton
                      aria-label={`Remove ${name}`}
                      onClick={() => removeCustomItem(item.id, id)}
                      size='small'
                      sx={{
                        position: 'absolute',
                        right: 44,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#f87171',
                        '&:hover': { background: 'rgba(248, 113, 113, 0.12)' },
                      }}
                    >
                      <FiTrash2 size={15} />
                    </IconButton>
                  ) : null}
                </Box>
              ),
            )}
          </Box>

          {item.id === SECTION_IDS.LED_WALL && selectedLedWall ? (
            <Box sx={{ marginTop: '0.6rem' }}>
              {riserItem && riserPrice ? (
                <Box
                  sx={{
                    marginTop: '0.75rem',
                    border: '1px solid #263244',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem 0.65rem',
                    background: '#111620',
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
                        color: '#c8d4e8',
                      },
                    }}
                    labelPlacement='start'
                  />

                  {riserItem.isChecked ? (
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        lineHeight: 1.45,
                        color: '#8a9ab5',
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

      {!sections.some((section) => section.isCustom) ? (
        <Box sx={{ margin: '0 1rem' }}>
          <Button
            variant='outlined'
            startIcon={<FiPlus />}
            onClick={addCustomSection}
            fullWidth
            sx={{ py: 1.25, borderStyle: 'dashed' }}
          >
            Add extras / reinforcements section
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}

export default ListChecker
