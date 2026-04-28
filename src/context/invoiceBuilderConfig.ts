import {
  EquipmentTypes,
  type LabelAndEquipmentProps,
} from '../components/Form/components/list-checker/listCheckerProps'
import {
  SAMPLE_OBJECT_ARRAY,
  SECTION_IDS,
  createItemId,
} from '../components/Form/components/list-checker/testData'

export type InvoiceFormValues = {
  clientName: string
  eventVenue: string
  eventDate: string
  packageOnePrice: string
  transpoFeePrice: string
}

export type PackageTemplate = {
  id: string
  name: string
  cardPrice: string
  priceLabel: string
  heroTitle: string
  heroAccent: string
  description: string
  highlights: string[]
  selectedEquipmentBySection: Record<string, string[]>
  defaultFormValues: Partial<InvoiceFormValues>
}

export const CUSTOM_PACKAGE_ID = 'custom'

export const createRandomInvoiceNumber = () =>
  String(Math.floor(Math.random() * 401) + 100)

export const createInitialFormValues = (): InvoiceFormValues => ({
  clientName: '',
  eventVenue: '',
  eventDate: '',
  packageOnePrice: '',
  transpoFeePrice: '',
})

export const initialFormValues: InvoiceFormValues = createInitialFormValues()

const itemIds = new Proxy({} as Record<string, string>, {
  get: (_, key) =>
    createItemId(String(key).toLowerCase().replaceAll('_', '-')),
})

const typeOrder: Record<EquipmentTypes, number> = {
  [EquipmentTypes.SPEAKER]: 0,
  [EquipmentTypes.SUBWOOFER]: 1,
  [EquipmentTypes.MIXER]: 2,
  [EquipmentTypes.MICROPHONE]: 3,
  [EquipmentTypes.LIGHT]: 4,
  [EquipmentTypes.ACCESSORY]: 5,
  [EquipmentTypes.INSTRUMENT]: 6,
  [EquipmentTypes.AMPLIFIER]: 7,
  [EquipmentTypes.EFFECT]: 8,
  [EquipmentTypes.LED_WALL]: 9,
  [EquipmentTypes.FEE]: 10,
}

export const createBaseSections = () =>
  SAMPLE_OBJECT_ARRAY.map((section) => ({
    ...section,
    equipment: [...section.equipment].sort(
      (a, b) => typeOrder[a.type] - typeOrder[b.type],
    ),
  }))

export const mergeSectionsWithBase = (
  savedSections?: LabelAndEquipmentProps[],
) => {
  const baseSections = createBaseSections()

  if (!savedSections) {
    return baseSections
  }

  return baseSections.map((baseSection) => {
    const savedSection = savedSections.find((section) => section.id === baseSection.id)

    if (!savedSection) {
      return baseSection
    }

    return {
      ...baseSection,
      equipment: baseSection.equipment.map((baseItem) => {
        const savedItem = savedSection.equipment.find((item) => item.id === baseItem.id)

        return savedItem
          ? {
              ...baseItem,
              isChecked: savedItem.isChecked,
            }
          : baseItem
      }),
    }
  })
}

export const packageTemplates: PackageTemplate[] = [
  {
    id: '7k-basic-sounds-and-lights',
    name: '7K Basic Sounds and Lights',
    cardPrice: '7K',
    priceLabel: '7K only',
    heroTitle: 'Basic Sounds and',
    heroAccent: 'Lights Package',
    description:
      'Basic sounds and lights package with core audio, microphones, lighting, and event accessories.',
    highlights: [
      '2 powered speakers and Allen & Heath SQ5 mixer',
      '2 wireless mics and 1 wired mic',
      '4 RGB backlights, 4 amber front lights, and DMX controller',
      '2 tech crews and transport service',
    ],
    selectedEquipmentBySection: {
      [SECTION_IDS.AUDIO_SYSTEM]: [
        createItemId('audio-speakers-2'),
        createItemId('audio-mixer-sq5'),
      ],
      [SECTION_IDS.LIGHTING_SYSTEM]: [
        createItemId('light-backlights-rgb-4'),
        createItemId('light-dmx-512-controller'),
        createItemId('light-front-lights-amber-4'),
        createItemId('accessory-t-bar-stands-2'),
      ],
      [SECTION_IDS.MICROPHONE]: [
        createItemId('mic-wireless-2'),
        createItemId('mic-wired-1'),
      ],
      [SECTION_IDS.OTHERS]: [
        createItemId('other-speaker-stands-2'),
        createItemId('other-xlr-cables'),
        createItemId('other-cable-ramps-2'),
        createItemId('other-extension-cables'),
        createItemId('other-aux-cable'),
        createItemId('other-mic-stand-1'),
        createItemId('other-lyric-stand-1'),
      ],
      [SECTION_IDS.CREW_AND_TRANSPORT]: [
        createItemId('crew-tech-2'),
        createItemId('crew-transport-service'),
      ],
    },
    defaultFormValues: {
      packageOnePrice: '7000',
    },
  },
  {
    id: '10k-sounds-and-lights-with-subwoofers',
    name: '10K Sounds and Lights with Subwoofers',
    cardPrice: '10K',
    priceLabel: '10K only',
    heroTitle: 'Sounds and Lights with',
    heroAccent: 'Subwoofers Package',
    description:
      'Audio package with subwoofers, microphones, lights, and the standard event support set.',
    highlights: [
      '2 powered speakers, SQ5 mixer, and 2 QSC subwoofers',
      '2 wireless mics and 1 wired mic',
      '4 RGB backlights, 4 amber front lights, and DMX controller',
      '3 tech crews and transport service',
    ],
    selectedEquipmentBySection: {
      [SECTION_IDS.AUDIO_SYSTEM]: [
        createItemId('audio-speakers-2'),
        createItemId('audio-mixer-sq5'),
        createItemId('audio-subwoofers-2-kw181'),
      ],
      [SECTION_IDS.LIGHTING_SYSTEM]: [
        createItemId('light-backlights-rgb-4'),
        createItemId('light-dmx-512-controller'),
        createItemId('light-front-lights-amber-4'),
        createItemId('accessory-t-bar-stands-2'),
      ],
      [SECTION_IDS.MICROPHONE]: [
        createItemId('mic-wireless-2'),
        createItemId('mic-wired-1'),
      ],
      [SECTION_IDS.OTHERS]: [
        createItemId('other-speaker-stands-2'),
        createItemId('other-xlr-cables'),
        createItemId('other-cable-ramps-2'),
        createItemId('other-extension-cables'),
        createItemId('other-aux-cable'),
        createItemId('other-mic-stand-1'),
        createItemId('other-lyric-stand-1'),
      ],
      [SECTION_IDS.CREW_AND_TRANSPORT]: [
        createItemId('crew-tech-3'),
        createItemId('crew-transport-service'),
      ],
    },
    defaultFormValues: {
      packageOnePrice: '10000',
    },
  },
  {
    id: '12k-sounds-and-lights-with-sub-and-monitors',
    name: '12K Sounds and Lights with Sub and Monitors',
    cardPrice: '12K',
    priceLabel: '12K only',
    heroTitle: 'Sounds and Lights',
    heroAccent: 'With Sub and Monitors',
    description:
      'Expanded audio setup with subwoofers and monitors, plus lighting, accessories, and transport support.',
    highlights: [
      '2 powered speakers, SQ5 mixer, 2 subwoofers, and 2 monitors',
      '2 wireless mics and 1 wired mic',
      '4 RGB backlights, 4 amber front lights, and DMX controller',
      '3 tech crews and transport service',
    ],
    selectedEquipmentBySection: {
      [SECTION_IDS.AUDIO_SYSTEM]: [
        itemIds.AUDIO_SPEAKERS_2,
        itemIds.AUDIO_MIXER_SQ5,
        itemIds.AUDIO_SUBWOOFERS_2_KW181,
        itemIds.AUDIO_MONITOR_SPEAKERS_2_QSC_K12,
      ],
      [SECTION_IDS.LIGHTING_SYSTEM]: [
        itemIds.LIGHT_BACKLIGHTS_RGB_4,
        itemIds.LIGHT_DMX_512_CONTROLLER,
        itemIds.LIGHT_FRONT_LIGHTS_AMBER_4,
        itemIds.ACCESSORY_T_BAR_STANDS_2,
      ],
      [SECTION_IDS.MICROPHONE]: [
        itemIds.MIC_WIRELESS_2,
        itemIds.MIC_WIRED_1,
      ],
      [SECTION_IDS.OTHERS]: [
        itemIds.OTHER_SPEAKER_STANDS_2,
        itemIds.OTHER_XLR_CABLES,
        itemIds.OTHER_CABLE_RAMPS_2,
        itemIds.OTHER_EXTENSION_CABLES,
        itemIds.OTHER_AUX_CABLE,
        itemIds.OTHER_MIC_STAND_1,
        itemIds.OTHER_LYRIC_STAND_1,
      ],
      [SECTION_IDS.CREW_AND_TRANSPORT]: [
        itemIds.CREW_TECH_3,
        itemIds.CREW_TRANSPORT_SERVICE,
      ],
    },
    defaultFormValues: {
      packageOnePrice: '12000',
    },
  },
  {
    id: '15k-sounds-and-lights',
    name: '15K Sounds and Lights',
    cardPrice: '15K',
    priceLabel: '15K only',
    heroTitle: 'Sounds and Lights',
    heroAccent: 'With Sub and Monitors',
    description:
      'Preset package with audio, lighting, microphones, and core accessories. After selecting it, the user can still add or remove any item before exporting the invoice.',
    highlights: [
      'RCF ART 745A MK4 speakers with subwoofers and monitor speakers',
      'Allen & Heath SQ5 digital mixer',
      'Wireless and wired microphone setup',
      'Beam 295 heads, backlights, front lights, and controller',
    ],
    selectedEquipmentBySection: {
      [SECTION_IDS.AUDIO_SYSTEM]: [
        itemIds.AUDIO_SPEAKERS_2,
        itemIds.AUDIO_MIXER_SQ5,
        itemIds.AUDIO_SUBWOOFERS_2_KW181,
        itemIds.AUDIO_MONITOR_SPEAKERS_2_QSC_K12,
      ],
      [SECTION_IDS.LIGHTING_SYSTEM]: [
        itemIds.LIGHT_BACKLIGHTS_RGB_8,
        itemIds.LIGHT_DMX_512_CONTROLLER,
        itemIds.LIGHT_FRONT_LIGHTS_AMBER_8,
        itemIds.ACCESSORY_T_BAR_STANDS_2,
        itemIds.LIGHT_MOVING_HEADLIGHTS_2,
      ],
      [SECTION_IDS.MICROPHONE]: [
        itemIds.MIC_WIRELESS_2,
        itemIds.MIC_WIRED_1,
      ],
      [SECTION_IDS.OTHERS]: [
        itemIds.OTHER_SPEAKER_STANDS_2,
        itemIds.OTHER_XLR_CABLES,
        itemIds.OTHER_CABLE_RAMPS_2,
        itemIds.OTHER_EXTENSION_CABLES,
        itemIds.OTHER_AUX_CABLE,
        itemIds.OTHER_MIC_STAND_1,
        itemIds.OTHER_LYRIC_STAND_1,
      ],
      [SECTION_IDS.CREW_AND_TRANSPORT]: [
        itemIds.CREW_TECH_3,
        itemIds.CREW_TRANSPORT_SERVICE,
      ],
    },
    defaultFormValues: {
      packageOnePrice: '15000',
    },
  },
  {
    id: '25k-sounds-and-lights-with-full-band-setup',
    name: '25K Sounds and Lights with Full Band Setup',
    cardPrice: '25K',
    priceLabel: '25K only',
    heroTitle: 'Sounds and Lights',
    heroAccent: 'With Full Band Setup',
    description:
      'Large full-band package with expanded monitors, drum kit support, amplifiers, microphones, lighting, and transport crew.',
    highlights: [
      'Expanded audio system with stage box, KLA181 subs, and 4 monitor speakers',
      'Wireless and wired vocal microphone setup',
      'Full drum package with drum mics and cymbals',
      'Guitar amps, bass amp, 5 tech crews, and transport service',
    ],
    selectedEquipmentBySection: {
      [SECTION_IDS.AUDIO_SYSTEM]: [
        itemIds.AUDIO_SPEAKERS_2,
        itemIds.AUDIO_MIXER_SQ5,
        itemIds.AUDIO_MONITOR_SPEAKERS_4_QSC_YAMAHA,
        itemIds.AUDIO_STAGE_BOX_AR2412,
        itemIds.AUDIO_SUB_2_KLA181,
      ],
      [SECTION_IDS.LIGHTING_SYSTEM]: [
        itemIds.LIGHT_BACKLIGHTS_RGB_8,
        itemIds.LIGHT_FRONT_LIGHTS_AMBER_4,
        itemIds.LIGHT_CONTROLLER_MINIPEARL_1024,
        itemIds.ACCESSORY_T_BAR_STANDS_4,
      ],
      [SECTION_IDS.MICROPHONE]: [
        itemIds.MIC_WIRELESS_2,
        itemIds.MIC_WIRED_2,
      ],
      [SECTION_IDS.OTHERS]: [
        itemIds.OTHER_SPEAKER_STANDS_2,
        itemIds.OTHER_XLR_CABLES,
        itemIds.OTHER_CABLE_RAMPS_2,
        itemIds.OTHER_EXTENSION_CABLES,
        itemIds.OTHER_AUX_CABLE,
        itemIds.OTHER_MIC_STANDS_3,
        itemIds.OTHER_LYRIC_STAND_1,
        itemIds.OTHER_FOG_MACHINE_1,
      ],
      [SECTION_IDS.CREW_AND_TRANSPORT]: [
        itemIds.CREW_TRANSPORT_SERVICE,
        itemIds.CREW_TECH_5,
      ],
      [SECTION_IDS.DRUMS]: [
        itemIds.DRUMS_DRUMSET,
        itemIds.DRUMS_CYMBALS,
        itemIds.DRUMS_KICK_PEDAL,
        itemIds.DRUMS_KICK_MIC,
        itemIds.DRUMS_SNARE_MIC,
        itemIds.DRUMS_TOM_MICS_2,
        itemIds.DRUMS_OVERHEAD_MIC_1,
      ],
      [SECTION_IDS.AMPLIFIERS]: [
        itemIds.AMP_GUITAR_AMPLIFIERS_2,
        itemIds.AMP_BASS_AMPLIFIER,
        itemIds.AMP_GUITAR_MICS_2,
      ],
    },
    defaultFormValues: {
      packageOnePrice: '25000',
    },
  },
  {
    id: '27k-school-event-package',
    name: '27K School Event Package',
    cardPrice: '27K',
    priceLabel: '27K only',
    heroTitle: 'School Event Package',
    heroAccent: 'Good for 1000 Guests',
    description:
      'Large-format school event package with expanded speaker coverage, more wireless mics, moving heads, wash lights, and full venue lighting support.',
    highlights: [
      'Expanded audio system with delay speakers and frontfill speakers',
      '4 wireless mics plus 1 wired mic',
      'Moving heads with trusses, moving wash, par lights, and haze machine',
      '3 tech crews and transport service',
    ],
    selectedEquipmentBySection: {
      [SECTION_IDS.AUDIO_SYSTEM]: [
        itemIds.AUDIO_SPEAKERS_2,
        itemIds.AUDIO_MIXER_SQ5,
        itemIds.AUDIO_SUBWOOFERS_2_KW181,
        itemIds.AUDIO_MONITOR_SPEAKERS_2_QSC_K12,
        itemIds.AUDIO_DELAY_SPEAKERS_2_RCF_915,
        itemIds.AUDIO_FRONTFILL_SPEAKERS_2_YAMAHA_DXR10,
      ],
      [SECTION_IDS.LIGHTING_SYSTEM]: [
        itemIds.LIGHT_CONTROLLER_MINIPEARL_1024,
        itemIds.LIGHT_MOVING_HEADS_SET_4_WITH_TRUSSES,
        itemIds.LIGHT_MOVING_WASH_2,
        itemIds.LIGHT_PAR_LIGHTS_16,
        itemIds.LIGHT_FRONTAL_LIGHTS_8,
        itemIds.EFFECT_HAZE_MACHINE,
      ],
      [SECTION_IDS.MICROPHONE]: [
        itemIds.MIC_WIRELESS_4,
        itemIds.MIC_WIRED_1,
      ],
      [SECTION_IDS.OTHERS]: [
        itemIds.OTHER_SPEAKER_STANDS_2,
        itemIds.OTHER_XLR_CABLES,
        itemIds.OTHER_CABLE_RAMPS_2,
        itemIds.OTHER_EXTENSION_CABLES,
        itemIds.OTHER_AUX_CABLE,
        itemIds.OTHER_MIC_STAND_1,
        itemIds.OTHER_LYRIC_STAND_1,
      ],
      [SECTION_IDS.CREW_AND_TRANSPORT]: [
        itemIds.CREW_TECH_3,
        itemIds.CREW_TRANSPORT_SERVICE,
      ],
      [SECTION_IDS.ADD_ONS]: [itemIds.ADDON_MOVING_HEADLIGHTS_2_MORE],
    },
    defaultFormValues: {
      packageOnePrice: '27000',
    },
  },
  {
    id: '30k-sounds-and-lights-with-full-band-setup',
    name: '30K Sounds and Lights with Full Band Setup',
    cardPrice: '30K',
    priceLabel: '30K only',
    heroTitle: 'Sounds and Lights',
    heroAccent: 'With Full Band Setup',
    description:
      'Premium full-band package with expanded monitors, drum kit support, amplifiers, moving heads, wash lights, and full transport crew.',
    highlights: [
      'Expanded audio system with stage box, KLA181 subs, and 4 monitor speakers',
      'Wireless and wired vocal microphone setup',
      'Full drum package with dedicated drum microphones',
      'Moving headlights, moving wash, 5 tech crews, and transport service',
    ],
    selectedEquipmentBySection: {
      [SECTION_IDS.AUDIO_SYSTEM]: [
        itemIds.AUDIO_SPEAKERS_2,
        itemIds.AUDIO_MIXER_SQ5,
        itemIds.AUDIO_MONITOR_SPEAKERS_4_QSC_YAMAHA,
        itemIds.AUDIO_STAGE_BOX_AR2412,
        itemIds.AUDIO_SUB_2_KLA181,
      ],
      [SECTION_IDS.LIGHTING_SYSTEM]: [
        itemIds.LIGHT_BACKLIGHTS_RGB_8,
        itemIds.LIGHT_FRONT_LIGHTS_AMBER_4,
        itemIds.LIGHT_CONTROLLER_MINIPEARL_1024,
        itemIds.ACCESSORY_T_BAR_STANDS_4,
        itemIds.LIGHT_MOVING_HEADLIGHTS_2,
        itemIds.LIGHT_MOVING_WASH_2,
      ],
      [SECTION_IDS.MICROPHONE]: [
        itemIds.MIC_WIRELESS_2,
        itemIds.MIC_WIRED_2,
      ],
      [SECTION_IDS.OTHERS]: [
        itemIds.OTHER_SPEAKER_STANDS_2,
        itemIds.OTHER_XLR_CABLES,
        itemIds.OTHER_CABLE_RAMPS_2,
        itemIds.OTHER_EXTENSION_CABLES,
        itemIds.OTHER_AUX_CABLE,
        itemIds.OTHER_MIC_STANDS_3,
        itemIds.OTHER_LYRIC_STAND_1,
        itemIds.OTHER_FOG_MACHINE_1,
      ],
      [SECTION_IDS.CREW_AND_TRANSPORT]: [
        itemIds.CREW_TRANSPORT_SERVICE,
        itemIds.CREW_TECH_5,
      ],
      [SECTION_IDS.DRUMS]: [
        itemIds.DRUMS_DRUMSET,
        itemIds.DRUMS_CYMBALS,
        itemIds.DRUMS_KICK_PEDAL,
        itemIds.DRUMS_KICK_MIC,
        itemIds.DRUMS_SNARE_MIC,
        itemIds.DRUMS_TOM_MICS_2,
        itemIds.DRUMS_OVERHEAD_MIC_1,
      ],
      [SECTION_IDS.AMPLIFIERS]: [
        itemIds.AMP_GUITAR_AMPLIFIERS_2,
        itemIds.AMP_BASS_AMPLIFIER,
        itemIds.AMP_GUITAR_MICS_2,
      ],
    },
    defaultFormValues: {
      packageOnePrice: '30000',
    },
  },
  {
    id: '70k-elegant-pageant-package',
    name: '70K Elegant Pageant Package',
    cardPrice: '70K',
    priceLabel: '70K only',
    heroTitle: 'Elegant Pageant',
    heroAccent: 'Package',
    description:
      'Large pageant package with expanded subs, moving heads with trusses, LED wall, stage platform, communications, and full show lighting.',
    highlights: [
      'Expanded audio system with 4 subwoofers, 4 monitor speakers, and stage box',
      '4 wireless mics and 2 wired mics',
      'Moving heads with trusses, moving wash, backdrop lights, and haze machine',
      'Built-in 9x12 LED wall, 16x24 stage, and 6 comm-set units',
    ],
    selectedEquipmentBySection: {
      [SECTION_IDS.AUDIO_SYSTEM]: [
        itemIds.AUDIO_SPEAKERS_2,
        itemIds.AUDIO_MIXER_SQ5,
        itemIds.AUDIO_MONITOR_SPEAKERS_4_QSC_YAMAHA,
        itemIds.AUDIO_STAGE_BOX_AR2412,
        itemIds.AUDIO_SUBWOOFERS_4_KLA181,
      ],
      [SECTION_IDS.LIGHTING_SYSTEM]: [
        itemIds.LIGHT_MOVING_HEADS_SET_4_WITH_TRUSSES,
        itemIds.LIGHT_MOVING_WASH_2,
        itemIds.LIGHT_CONTROLLER_MINIPEARL_1024,
        itemIds.LIGHT_FRONTAL_LIGHTS_8,
        itemIds.LIGHT_BACKDROP_LIGHTS_16,
        itemIds.EFFECT_HAZE_MACHINE,
      ],
      [SECTION_IDS.MICROPHONE]: [
        itemIds.MIC_WIRELESS_4,
        itemIds.MIC_WIRED_2,
      ],
      [SECTION_IDS.OTHERS]: [
        itemIds.OTHER_SPEAKER_STANDS_2,
        itemIds.OTHER_XLR_CABLES,
        itemIds.OTHER_CABLE_RAMPS_2,
        itemIds.OTHER_EXTENSION_CABLES,
        itemIds.OTHER_AUX_CABLE,
        itemIds.OTHER_MIC_STANDS_3,
        itemIds.OTHER_LYRIC_STAND_1,
        itemIds.OTHER_COMM_SET_6,
        itemIds.OTHER_LED_WALL_9X12,
        itemIds.OTHER_STAGE_16X24,
      ],
    },
    defaultFormValues: {
      packageOnePrice: '70000',
    },
  },
]

export const packageTemplatesById = Object.fromEntries(
  packageTemplates.map((template) => [template.id, template]),
) as Record<string, PackageTemplate>

export const getPackageTemplate = (packageId: string) =>
  packageTemplatesById[packageId]

export const createSectionsForTemplate = (packageId: string) => {
  const template = getPackageTemplate(packageId)
  const baseSections = createBaseSections()

  if (!template) {
    return baseSections
  }

  return baseSections.map((section) => ({
    ...section,
    equipment: section.equipment.map((item) => ({
      ...item,
      isChecked: template.selectedEquipmentBySection[section.id]?.includes(item.id) ?? false,
    })),
  }))
}

export const createFormValuesForTemplate = (
  packageId: string,
  overrides?: Partial<InvoiceFormValues>,
) => {
  const template = getPackageTemplate(packageId)

  return {
    ...createInitialFormValues(),
    ...template?.defaultFormValues,
    ...overrides,
  }
}

