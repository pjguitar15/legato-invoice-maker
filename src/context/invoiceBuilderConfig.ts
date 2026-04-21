import {
  EquipmentTypes,
  type LabelAndEquipmentProps,
} from '../components/Form/components/list-checker/listCheckerProps'
import { SAMPLE_OBJECT_ARRAY } from '../components/Form/components/list-checker/testData'

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
  selectedEquipmentBySection: Record<number, number[]>
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
      1: [101, 102],
      2: [201, 203, 204, 206],
      3: [301, 302],
      4: [401, 402, 403, 404, 405, 406, 407],
      5: [501, 503],
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
      1: [101, 102, 103],
      2: [201, 203, 204, 206],
      3: [301, 302],
      4: [401, 402, 403, 404, 405, 406, 407],
      5: [502, 503],
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
      1: [101, 102, 103, 104],
      2: [201, 203, 204, 206],
      3: [301, 302],
      4: [401, 402, 403, 404, 405, 406, 407],
      5: [502, 503],
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
      1: [101, 102, 103, 104],
      2: [202, 203, 205, 206, 207],
      3: [301, 302],
      4: [401, 402, 403, 404, 405, 406, 407],
      5: [502, 503],
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
      1: [101, 102, 105, 106, 107],
      2: [202, 204, 209, 210],
      3: [301, 303],
      4: [401, 402, 403, 404, 405, 408, 407, 409],
      5: [503, 504],
      10: [1001, 1002, 1003, 1004, 1005, 1006, 1007],
      11: [1101, 1102, 1103],
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
      1: [101, 102, 103, 104, 108, 109],
      2: [209, 211, 212, 213, 214, 215],
      3: [304, 302],
      4: [401, 402, 403, 404, 405, 406, 407],
      5: [502, 503],
      6: [604],
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
      1: [101, 102, 105, 106, 107],
      2: [202, 204, 209, 210, 207, 212],
      3: [301, 303],
      4: [401, 402, 403, 404, 405, 408, 407, 409],
      5: [503, 504],
      10: [1001, 1002, 1003, 1004, 1005, 1006, 1007],
      11: [1101, 1102, 1103],
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
      1: [101, 102, 105, 106, 110],
      2: [211, 212, 209, 214, 216, 215],
      3: [304, 303],
      4: [401, 402, 403, 404, 405, 408, 407, 410, 411, 412],
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
