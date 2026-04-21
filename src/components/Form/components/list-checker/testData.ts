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
      {
        id: 105,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '4 Monitor Speakers - QSC K12 & Yamaha DXR10',
      },
      {
        id: 106,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '1 Digital Stage Box - Allen & Heath AR2412',
      },
      {
        id: 107,
        isChecked: false,
        type: EquipmentTypes.SUBWOOFER,
        name: '2 Subwoofers - QSC KLA181',
      },
      {
        id: 108,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Delay Speakers - RCF 915',
      },
      {
        id: 109,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Frontfill Speakers - Yamaha DXR10',
      },
      {
        id: 110,
        isChecked: false,
        type: EquipmentTypes.SUBWOOFER,
        name: '4 Subwoofers - QSC KLA181',
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
        id: 209,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '1 Light Controller - Minipearl 1024',
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
        id: 210,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '4 T-Bar Stands - Holds Par Lights',
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
      {
        id: 211,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '4 Moving Heads Set - Beam 295 w/ Trusses',
      },
      {
        id: 212,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 Moving Wash - 19x15WATT LED',
      },
      {
        id: 213,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '16 PCS Par Lights - RGB Par Lights',
      },
      {
        id: 214,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '8 Frontal Lights - Amber White Par Lights',
      },
      {
        id: 215,
        isChecked: false,
        type: EquipmentTypes.EFFECT,
        name: 'Haze Machine - For Stage Haze',
      },
      {
        id: 216,
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '16 PCS Back Drop Lights - RGB Par Lights',
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
      {
        id: 303,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '2 Wired Mics - Sennheiser E935',
      },
      {
        id: 304,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '4 Wireless Mics - Mipro 311B',
      },
    ],
  },
  {
    id: 10,
    label: 'Drums',
    equipment: [
      {
        id: 1001,
        isChecked: false,
        type: EquipmentTypes.INSTRUMENT,
        name: 'Drumset - Pearl Export',
      },
      {
        id: 1002,
        isChecked: false,
        type: EquipmentTypes.INSTRUMENT,
        name: 'Cymbals - Sabian HHX & AAX',
      },
      {
        id: 1003,
        isChecked: false,
        type: EquipmentTypes.INSTRUMENT,
        name: 'Kick Pedal - Iron Cobra 600',
      },
      {
        id: 1004,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Kick Mic - Shure Beta 52A',
      },
      {
        id: 1005,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Snare Mic - Shure SM57',
      },
      {
        id: 1006,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '2 Tom Mics - Shure PGA 56',
      },
      {
        id: 1007,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '1 Overhead Mic - Shure PGA 81',
      },
    ],
  },
  {
    id: 11,
    label: 'Amplifiers',
    equipment: [
      {
        id: 1101,
        isChecked: false,
        type: EquipmentTypes.AMPLIFIER,
        name: '2 Guitar Amplifiers - Laney LX120R Twin',
      },
      {
        id: 1102,
        isChecked: false,
        type: EquipmentTypes.AMPLIFIER,
        name: 'Bass Amplifier - GK MB115',
      },
      {
        id: 1103,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '2 Guitar Mics - Shure SM56',
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
        id: 408,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '3 Mic Stands - With Press to Adjust',
      },
      {
        id: 407,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '1 Lyric Stand - Add Upon Request',
      },
      {
        id: 409,
        isChecked: false,
        type: EquipmentTypes.EFFECT,
        name: '1 Fog Machine - Titanium Audio',
      },
      {
        id: 410,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '6 Comm-Set - Event Communication',
      },
      {
        id: 411,
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '9x12 FT LED Wall - 7680 Refresh Rate, 1K NITS',
      },
      {
        id: 412,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '16x24 FT Stage - Aluminum Stage w/ Stairs',
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
      {
        id: 504,
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '5 Tech Crews - Experts from Legato',
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
      {
        id: 605,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Yamaha Monitors (+P2,000)',
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
        name: '9x14 ft LED Wall',
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
  {
    id: 12,
    label: 'LED Wall Riser',
    equipment: [
      {
        id: 1201,
        isChecked: false,
        type: EquipmentTypes.FEE,
        name: 'Riser',
      },
    ],
  },
]
