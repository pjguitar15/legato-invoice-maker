import { MdOutlineSpeaker } from 'react-icons/md'
import { PiMicrophoneStageBold } from 'react-icons/pi'
import { RxMixerVertical } from 'react-icons/rx'

export const EquipmentTypes = {
  SPEAKER: 'speaker',
  MIXER: 'mixer',
  MICROPHONE: 'microphone',
} as const

export type EquipmentTypes =
  (typeof EquipmentTypes)[keyof typeof EquipmentTypes]

export type ListItemData = {
  id: number
  isChecked: boolean
  name: string
  type: EquipmentTypes
}

export type ListProps = ListItemData & {
  sectionId: number
  handleCheckClick: (sectionId: number, id: number) => void
}

export const equipmentIcons = {
  [EquipmentTypes.SPEAKER]: MdOutlineSpeaker,
  [EquipmentTypes.MIXER]: RxMixerVertical,
  [EquipmentTypes.MICROPHONE]: PiMicrophoneStageBold,
}

export type LabelAndEquipmentProps = {
  id: number
  label: string
  equipment: ListItemData[]
}
