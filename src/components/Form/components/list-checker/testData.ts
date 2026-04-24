import { customRandom } from 'nanoid'
import { EquipmentTypes, type LabelAndEquipmentProps } from './listCheckerProps'

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

const createStableId = (prefix: string, seed: string) => {
  let state = Array.from(seed).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    0,
  )

  const generator = customRandom(ID_ALPHABET, 6, (size) => {
    const bytes = new Uint8Array(size)

    for (let index = 0; index < size; index += 1) {
      state = (state * 1664525 + 1013904223) >>> 0
      bytes[index] = state & 255
    }

    return bytes
  })

  return `${prefix}_${generator()}`
}

export const createSectionId = (seed: string) => createStableId('sec', seed)

export const createItemId = (seed: string) => createStableId('itm', seed)

export const SECTION_IDS = {
  AUDIO_SYSTEM: createSectionId('audio-system'),
  LIGHTING_SYSTEM: createSectionId('lighting-system'),
  MICROPHONE: createSectionId('microphone'),
  DRUMS: createSectionId('drums'),
  AMPLIFIERS: createSectionId('amplifiers'),
  OTHERS: createSectionId('others'),
  CREW_AND_TRANSPORT: createSectionId('crew-and-transport'),
  ADD_ONS: createSectionId('add-ons'),
  LED_WALL: createSectionId('led-wall'),
  OFFICIAL_RECEIPT_FEE: createSectionId('official-receipt-fee'),
  TRANSPORTATION_FEE: createSectionId('transportation-fee'),
  LED_WALL_RISER: createSectionId('led-wall-riser'),
} as const

export const SAMPLE_OBJECT_ARRAY: LabelAndEquipmentProps[] = [
  {
    id: SECTION_IDS.AUDIO_SYSTEM,
    label: 'Audio System',
    equipment: [
      {
        id: createItemId('audio-speakers-2'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Powered Speakers - RCF ART 745A MK4',
      },
      {
        id: createItemId('audio-speakers-2-dup'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Powered Speakers - RCF ART 745A MK4',
      },
      {
        id: createItemId('audio-speakers-2-yamaha-dzr15'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Powered Speakers - Yamaha DZR15',
      },
      {
        id: createItemId('audio-speakers-2-rcf-935'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Powered Speakers - RCF 935',
      },
      {
        id: createItemId('audio-mixer-sq5'),
        isChecked: false,
        type: EquipmentTypes.MIXER,
        name: '1 Digital Mixer - Allen & Heath SQ5',
      },
      {
        id: createItemId('audio-subwoofers-2-kw181'),
        isChecked: false,
        type: EquipmentTypes.SUBWOOFER,
        name: '2 Subwoofers - QSC KW181',
      },
      {
        id: createItemId('audio-monitor-speakers-2-qsc-k12'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Monitor Speakers - QSC K12',
      },
      {
        id: createItemId('audio-monitor-speakers-4-qsc-yamaha'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '4 Monitor Speakers - QSC K12 & Yamaha DXR10',
      },
      {
        id: createItemId('audio-stage-box-ar2412'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '1 Digital Stage Box - Allen & Heath AR2412',
      },
      {
        id: createItemId('audio-subwoofers-2-kla181'),
        isChecked: false,
        type: EquipmentTypes.SUBWOOFER,
        name: '2 Subwoofers - QSC KLA181',
      },
      {
        id: createItemId('audio-delay-speakers-2-rcf-915'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Delay Speakers - RCF 915',
      },
      {
        id: createItemId('audio-frontfill-speakers-2-yamaha-dxr10'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Frontfill Speakers - Yamaha DXR10',
      },
      {
        id: createItemId('audio-subwoofers-4-kla181'),
        isChecked: false,
        type: EquipmentTypes.SUBWOOFER,
        name: '4 Subwoofers - QSC KLA181',
      },
    ],
  },
  {
    id: SECTION_IDS.LIGHTING_SYSTEM,
    label: 'Lighting System',
    equipment: [
      {
        id: createItemId('light-backlights-rgb-4'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '4 Par RGB Backlights',
      },
      {
        id: createItemId('light-backlights-rgb-8'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '8 Par RGB Backlights',
      },
      {
        id: createItemId('light-dmx-512-controller'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '1 DMX 512 Controller - DMX 512',
      },
      {
        id: createItemId('light-controller-minipearl-1024'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '1 Light Controller - Minipearl 1024',
      },
      {
        id: createItemId('light-front-lights-amber-4'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '4 Amber Front Lights',
      },
      {
        id: createItemId('light-front-lights-amber-8'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '8 Amber Front Lights',
      },
      {
        id: createItemId('accessory-t-bar-stands-2'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 T-Bar Stands - Holds Par Lights',
      },
      {
        id: createItemId('accessory-t-bar-stands-4'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '4 T-Bar Stands - Holds Par Lights',
      },
      {
        id: createItemId('light-moving-headlights-2'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 Moving Headlights - Beam 295',
      },
      {
        id: createItemId('light-moving-headlights-2-more'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 More Moving Headlights - Beam 295 (+P2,000)',
      },
      {
        id: createItemId('light-moving-heads-set-4-with-trusses'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '4 Moving Heads Set - Beam 295 w/ Trusses',
      },
      {
        id: createItemId('light-moving-wash-2'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 Moving Wash - 19x15WATT LED',
      },
      {
        id: createItemId('light-par-lights-16'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '16 PCS Par Lights - RGB Par Lights',
      },
      {
        id: createItemId('light-frontal-lights-8'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '8 Frontal Lights - Amber White Par Lights',
      },
      {
        id: createItemId('effect-haze-machine'),
        isChecked: false,
        type: EquipmentTypes.EFFECT,
        name: 'Haze Machine - For Stage Haze',
      },
      {
        id: createItemId('light-backdrop-lights-16'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '16 PCS Back Drop Lights - RGB Par Lights',
      },
    ],
  },
  {
    id: SECTION_IDS.MICROPHONE,
    label: 'Microphone',
    equipment: [
      {
        id: createItemId('mic-wireless-2'),
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '2 Wireless Mics - Mipro 311B',
      },
      {
        id: createItemId('mic-wired-1'),
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '1 Wired Mic - Sennheiser E935',
      },
      {
        id: createItemId('mic-wired-2'),
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '2 Wired Mics - Sennheiser E935',
      },
      {
        id: createItemId('mic-wireless-4'),
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '4 Wireless Mics - Mipro 311B',
      },
    ],
  },
  {
    id: SECTION_IDS.DRUMS,
    label: 'Drums',
    equipment: [
      {
        id: createItemId('drums-drumset'),
        isChecked: false,
        type: EquipmentTypes.INSTRUMENT,
        name: 'Drumset - Pearl Export',
      },
      {
        id: createItemId('drums-cymbals'),
        isChecked: false,
        type: EquipmentTypes.INSTRUMENT,
        name: 'Cymbals - Sabian HHX & AAX',
      },
      {
        id: createItemId('drums-kick-pedal'),
        isChecked: false,
        type: EquipmentTypes.INSTRUMENT,
        name: 'Kick Pedal - Iron Cobra 600',
      },
      {
        id: createItemId('drums-kick-mic'),
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Kick Mic - Shure Beta 52A',
      },
      {
        id: createItemId('drums-snare-mic'),
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Snare Mic - Shure SM57',
      },
      {
        id: createItemId('drums-tom-mics-2'),
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '2 Tom Mics - Shure PGA 56',
      },
      {
        id: createItemId('drums-overhead-mic-1'),
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '1 Overhead Mic - Shure PGA 81',
      },
    ],
  },
  {
    id: SECTION_IDS.AMPLIFIERS,
    label: 'Amplifiers',
    equipment: [
      {
        id: createItemId('amp-guitar-amplifiers-2'),
        isChecked: false,
        type: EquipmentTypes.AMPLIFIER,
        name: '2 Guitar Amplifiers - Laney LX120R Twin',
      },
      {
        id: createItemId('amp-bass-amplifier'),
        isChecked: false,
        type: EquipmentTypes.AMPLIFIER,
        name: 'Bass Amplifier - GK MB115',
      },
      {
        id: createItemId('amp-guitar-mics-2'),
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: '2 Guitar Mics - Shure SM56',
      },
    ],
  },
  {
    id: SECTION_IDS.OTHERS,
    label: 'Others',
    equipment: [
      {
        id: createItemId('other-speaker-stands-2'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 Speaker Stands - Height Adjustable Stands',
      },
      {
        id: createItemId('other-xlr-cables'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: 'XLR Cables - Enough Cables for Event',
      },
      {
        id: createItemId('other-cable-ramps-2'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 Cable Ramps - Solid Quality Ramps',
      },
      {
        id: createItemId('other-extension-cables'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: 'Extension Cables - High Quality Extension Cables',
      },
      {
        id: createItemId('other-aux-cable'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '3.5mm Aux Cable - Play Your Music for Event',
      },
      {
        id: createItemId('other-mic-stand-1'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '1 Mic Stand - With Press to Adjust',
      },
      {
        id: createItemId('other-mic-stands-3'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '3 Mic Stands - With Press to Adjust',
      },
      {
        id: createItemId('other-lyric-stand-1'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '1 Lyric Stand - Add Upon Request',
      },
      {
        id: createItemId('other-fog-machine-1'),
        isChecked: false,
        type: EquipmentTypes.EFFECT,
        name: '1 Fog Machine - Titanium Audio',
      },
      {
        id: createItemId('other-comm-set-6'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '6 Comm-Set - Event Communication',
      },
      {
        id: createItemId('other-led-wall-9x12'),
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '9x12 FT LED Wall - 7680 Refresh Rate, 1K NITS',
      },
      {
        id: createItemId('other-led-wall-9x14'),
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '9x14 FT LED Wall - 7680 Refresh Rate, 1K NITS',
      },
      {
        id: createItemId('other-stage-16x24'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '16x24 FT Stage - Aluminum Stage w/ Stairs',
      },
    ],
  },
  {
    id: SECTION_IDS.CREW_AND_TRANSPORT,
    label: 'Crew and Transport',
    equipment: [
      {
        id: createItemId('crew-tech-2'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '2 Tech Crews - Experts from Legato',
      },
      {
        id: createItemId('crew-tech-3'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '3 Tech Crews - Experts from Legato',
      },
      {
        id: createItemId('crew-tech-4'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '4 Tech Crews - Experts from Legato',
      },
      {
        id: createItemId('crew-transport-service'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: 'Transport Service - Mitsubishi L300',
      },
      {
        id: createItemId('crew-tech-5'),
        isChecked: false,
        type: EquipmentTypes.ACCESSORY,
        name: '5 Tech Crews - Experts from Legato',
      },
    ],
  },
  {
    id: SECTION_IDS.ADD_ONS,
    label: 'Add-ons',
    equipment: [
      {
        id: createItemId('addon-qsc-subwoofers-2'),
        isChecked: false,
        type: EquipmentTypes.SUBWOOFER,
        name: '2 QSC Subwoofers (+P3,000)',
      },
      {
        id: createItemId('addon-qsc-monitor-speakers-2'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 QSC Monitor Speakers (+P2,000)',
      },
      {
        id: createItemId('addon-moving-headlights-2'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 Moving Headlights (+P2,000)',
      },
      {
        id: createItemId('addon-moving-headlights-2-more'),
        isChecked: false,
        type: EquipmentTypes.LIGHT,
        name: '2 More Moving Headlights (+P2,000)',
      },
      {
        id: createItemId('addon-yamaha-monitors-2'),
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: '2 Yamaha Monitors (+P2,000)',
      },
    ],
  },
  {
    id: SECTION_IDS.LED_WALL,
    label: 'LED Wall',
    singleSelect: true,
    equipment: [
      {
        id: createItemId('led-wall-9x12'),
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '9x12 ft LED Wall',
      },
      {
        id: createItemId('led-wall-9x14'),
        isChecked: false,
        type: EquipmentTypes.LED_WALL,
        name: '9x14 ft LED Wall',
      },
    ],
  },
  {
    id: SECTION_IDS.OFFICIAL_RECEIPT_FEE,
    label: 'Official Receipt Fee',
    equipment: [
      {
        id: createItemId('fee-or'),
        isChecked: false,
        type: EquipmentTypes.FEE,
        name: 'OR Fee',
      },
    ],
  },
  {
    id: SECTION_IDS.TRANSPORTATION_FEE,
    label: 'Transportation Fee',
    equipment: [
      {
        id: createItemId('fee-transpo'),
        isChecked: false,
        type: EquipmentTypes.FEE,
        name: 'Transpo Fee',
      },
    ],
  },
  {
    id: SECTION_IDS.LED_WALL_RISER,
    label: 'LED Wall Riser',
    equipment: [
      {
        id: createItemId('fee-riser'),
        isChecked: false,
        type: EquipmentTypes.FEE,
        name: 'Riser',
      },
    ],
  },
]
