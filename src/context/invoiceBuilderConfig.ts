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
  ledWallPrice: string
  orFeePrice: string
  transpoFeePrice: string
}

export type PackageTemplate = {
  id: string
  name: string
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
  clientName: 'Gloriamaris Greenhills',
  eventVenue: 'Gloriamaris Greenhills',
  eventDate: '2026-01-29',
  packageOnePrice: '15000',
  ledWallPrice: '18000',
  orFeePrice: '4000',
  transpoFeePrice: '2000',
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
    id: '15k-sounds-and-lights',
    name: '15K Sounds and Lights',
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
      1: [102, 103, 104, 6, 107, 108, 109, 110, 111],
      2: [200, 201, 202, 204, 205],
      3: [300, 301, 303, 304],
    },
    defaultFormValues: {
      packageOnePrice: '15000',
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
