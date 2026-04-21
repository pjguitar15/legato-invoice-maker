import { EquipmentTypes, type LabelAndEquipmentProps } from './listCheckerProps'

export const SAMPLE_OBJECT_ARRAY: LabelAndEquipmentProps[] = [
  {
    id: 1,
    label: 'Audio System',
    equipment: [
      {
        id: 1,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'RCF ART 745A',
      },
      {
        id: 2,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'Yamaha DZR15',
      },
      {
        id: 3,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'QSC K12',
      },
      {
        id: 4,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'RCF ART 745A',
      },
      {
        id: 6,
        isChecked: false,
        type: EquipmentTypes.MIXER,
        name: 'Allen & Heath SQ5',
      },
      {
        id: 100,
        isChecked: false,
        type: EquipmentTypes.MIXER,
        name: 'Yamaha DM3',
      },
      {
        id: 101,
        isChecked: false,
        type: EquipmentTypes.MIXER,
        name: 'Allen & Heath SQ5',
      },
      {
        id: 102,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'RCF ART 745A MK4',
      },
      {
        id: 103,
        isChecked: false,
        type: EquipmentTypes.SUBWOOFER,
        name: 'QSC KW181',
      },
      {
        id: 104,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'QSC K12',
      },
      {
        id: 105,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'Yamaha DXR10',
      },
      {
        id: 106,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: 'Allen & Heath AR2412 Snake Box',
      },
      {
        id: 107,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 Speaker Stands',
      },
      {
        id: 108,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: 'XLR Cables',
      },
      {
        id: 109,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 Cable Ramps',
      },
      {
        id: 110,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: 'Extension Cables',
      },
      {
        id: 111,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '3.5mm Aux Cable',
      },
    ],
  },

  {
    id: 2,
    label: 'Lighting System',
    equipment: [
      {
        id: 200,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: 'Flat RGBW Par Lights',
      },
      {
        id: 201,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '4 Eye COB Amber Lights',
      },
      {
        id: 202,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: 'Beam 295 Wash Lights',
      },
      {
        id: 203,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: 'Mini Pearl 1024 Light Controller',
      },
      {
        id: 204,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '512 DMX Light Controller',
      },
      {
        id: 205,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 T-Bar Stands',
      },
    ],
  },
  {
    id: 3,
    label: 'Vocal Microphones',
    equipment: [
      {
        id: 1,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Sennheiser Wired Mics',
      },
      {
        id: 2,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Mipro 311B',
      },
      {
        id: 300,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Mipro ACT 311B Wireless Mic',
      },
      {
        id: 301,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Sennheiser E935 Wired Mic',
      },
      {
        id: 302,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Shure Drum Mic Set (BETA52A, SM57, PG56, PGA81)',
      },
      {
        id: 303,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '1 Mic Stand',
      },
      {
        id: 304,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '1 Lyric Stand',
      },
    ],
  },
  {
    id: 4,
    label: 'LED Wall',
    singleSelect: true,
    equipment: [
      {
        id: 1,
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '9x12 ft LED Wall',
      },
      {
        id: 2,
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '10x13 ft LED Wall',
      },
      {
        id: 3,
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '10x12 ft LED Wall',
      },
    ],
  },
  {
    id: 5,
    label: 'Official Receipt Fee',
    equipment: [
      {
        id: 1,
        isChecked: false,
        type: EquipmentTypes.FEE,
        name: 'OR Fee',
      },
    ],
  },
  {
    id: 6,
    label: 'Transportation Fee',
    equipment: [
      {
        id: 1,
        isChecked: false,
        type: EquipmentTypes.FEE,
        name: 'Transpo fee',
      },
    ],
  },
]
