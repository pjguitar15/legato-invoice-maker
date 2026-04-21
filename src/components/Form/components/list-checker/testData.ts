import { EquipmentTypes, type LabelAndEquipmentProps } from './listCheckerProps'

export const SAMPLE_OBJECT_ARRAY: LabelAndEquipmentProps[] = [
  {
    id: 1,
    label: 'Audio System',
    equipment: [
      {
        id: 101,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Powered Speakers - RCF ART 745A MK4',
      },
      {
        id: 102,
        isChecked: false,
        type: EquipmentTypes.MIXER,
        name: '1 Digital Mixer - Allen & Heath SQ5',
      },
      {
        id: 103,
        isChecked: false,
        type: EquipmentTypes.SUBWOOFER,
        name: '2 Subwoofers - QSC KW181',
      },
      {
        id: 104,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Monitor Speakers - QSC K12',
      },
    ],
  },
  {
    id: 2,
    label: 'Lighting System',
    equipment: [
      {
        id: 201,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '4 Par RGB Backlights - Kosmo/Aerolites',
      },
      {
        id: 202,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '8 Par RGB Backlights - Kosmo/Aerolites',
      },
      {
        id: 203,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '1 DMX 512 Controller - DMX 512',
      },
      {
        id: 204,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '4 Amber Front Lights - Kosmo/Aerolites/Lumilites',
      },
      {
        id: 205,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '8 Amber Front Lights - Kosmo/Aerolites/Lumilites',
      },
      {
        id: 206,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 T-Bar Stands - Holds Par Lights',
      },
      {
        id: 207,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 Moving Headlights - Beam 295',
      },
      {
        id: 208,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 More Moving Headlights - Beam 295 (+P2,000)',
      },
    ],
  },
  {
    id: 3,
    label: 'Microphone',
    equipment: [
      {
        id: 301,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '2 Wireless Mics - Mipro 311B',
      },
      {
        id: 302,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '1 Wired Mic - Sennheiser E935',
      },
    ],
  },
  {
    id: 4,
    label: 'Others',
    equipment: [
      {
        id: 401,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 Speaker Stands - Height Adjustable Stands',
      },
      {
        id: 402,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: 'XLR Cables - Enough Cables for Event',
      },
      {
        id: 403,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 Cable Ramps - Solid Quality Ramps',
      },
      {
        id: 404,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: 'Extension Cables - High Quality Extension Cables',
      },
      {
        id: 405,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '3.5mm Aux Cable - Play Your Music for Event',
      },
      {
        id: 406,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '1 Mic Stand - With Press to Adjust',
      },
      {
        id: 407,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '1 Lyric Stand - Add Upon Request',
      },
    ],
  },
  {
    id: 5,
    label: 'Crew and Transport',
    equipment: [
      {
        id: 501,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 Tech Crews - Experts from Legato',
      },
      {
        id: 502,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '3 Tech Crews - Experts from Legato',
      },
      {
        id: 503,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: 'Transport Service - Mitsubishi L300',
      },
    ],
  },
  {
    id: 6,
    label: 'Add-ons',
    equipment: [
      {
        id: 601,
        isChecked: false,
        type: EquipmentTypes.SUBWOOFER,
        name: '2 QSC Subwoofers (+P3,000)',
      },
      {
        id: 602,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 QSC Monitor Speakers (+P2,000)',
      },
      {
        id: 603,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 Moving Headlights (+P2,000)',
      },
      {
        id: 604,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 More Moving Headlights (+P2,000)',
      },
    ],
  },
  {
    id: 7,
    label: 'LED Wall',
    singleSelect: true,
    equipment: [
      {
        id: 701,
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '9x12 ft LED Wall',
      },
      {
        id: 702,
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '10x13 ft LED Wall',
      },
      {
        id: 703,
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '10x12 ft LED Wall',
      },
    ],
  },
  {
    id: 8,
    label: 'Official Receipt Fee',
    equipment: [
      {
        id: 801,
        isChecked: false,
        type: EquipmentTypes.FEE,
        name: 'OR Fee',
      },
    ],
  },
  {
    id: 9,
    label: 'Transportation Fee',
    equipment: [
      {
        id: 901,
        isChecked: false,
        type: EquipmentTypes.FEE,
        name: 'Transpo Fee',
      },
    ],
  },
]
