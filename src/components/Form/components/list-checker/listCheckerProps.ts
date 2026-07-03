import { MdOutlineSpeaker } from 'react-icons/md'
import { FaDrum, FaFan, FaGuitar, FaReceipt } from 'react-icons/fa6'
import { PiMicrophoneStageBold } from 'react-icons/pi'
import { RxMixerVertical } from 'react-icons/rx'
import { TbDeviceTvOld, TbWaveSine } from 'react-icons/tb'
import { GiLightProjector } from 'react-icons/gi'
import { BsBoxSeam } from 'react-icons/bs'

export const EquipmentTypes = {
  SPEAKER: 'speaker',
  MIXER: 'mixer',
  MICROPHONE: 'microphone',
  LED_WALL: 'led-wall',
  FEE: 'fee',
  SUBWOOFER: 'subwoofer',
  LIGHT: 'light',
  ACCESSORY: 'accessory',
  INSTRUMENT: 'instrument',
  AMPLIFIER: 'amplifier',
  EFFECT: 'effect',
} as const

export type EquipmentTypes =
  (typeof EquipmentTypes)[keyof typeof EquipmentTypes]

export type ListItemData = {
  id: string
  isChecked: boolean
  name: string
  type: EquipmentTypes
}

export type ListProps = ListItemData & {
  sectionId: string
  handleCheckClick: (sectionId: string, id: string) => void
}

export const equipmentIcons = {
  [EquipmentTypes.SPEAKER]: MdOutlineSpeaker,
  [EquipmentTypes.MIXER]: RxMixerVertical,
  [EquipmentTypes.MICROPHONE]: PiMicrophoneStageBold,
  [EquipmentTypes.LED_WALL]: TbDeviceTvOld,
  [EquipmentTypes.FEE]: FaReceipt,
  [EquipmentTypes.SUBWOOFER]: TbWaveSine,
  [EquipmentTypes.LIGHT]: GiLightProjector,
  [EquipmentTypes.ACCESSORY]: BsBoxSeam,
  [EquipmentTypes.INSTRUMENT]: FaDrum,
  [EquipmentTypes.AMPLIFIER]: FaGuitar,
  [EquipmentTypes.EFFECT]: FaFan,
}

export type LabelAndEquipmentProps = {
  id: string
  label: string
  isCustom?: boolean
  customPrice?: string
  singleSelect?: boolean
  equipment: ListItemData[]
}
