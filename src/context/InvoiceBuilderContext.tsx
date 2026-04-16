import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type PropsWithChildren,
} from 'react'
import {
  EquipmentTypes,
  type LabelAndEquipmentProps,
} from '../components/Form/components/list-checker/listCheckerProps'
import { SAMPLE_OBJECT_ARRAY } from '../components/Form/components/list-checker/testData'

export type InvoiceFormValues = {
  invoiceNumber: string
  clientName: string
  eventVenue: string
  preparedBy: string
  preparedDate: string
  eventDate: string
  packageOnePrice: string
  ledWallPrice: string
  orFeePrice: string
  transpoFeePrice: string
}

type InvoiceBuilderContextValue = {
  formValues: InvoiceFormValues
  sections: LabelAndEquipmentProps[]
  handleFieldChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleCheckClick: (sectionId: number, id: number) => void
}

const STORAGE_KEY = 'legato-invoice-builder'

const initialFormValues: InvoiceFormValues = {
  invoiceNumber: '0157',
  clientName: 'Gloriamaris Greenhills',
  eventVenue: 'Gloriamaris Greenhills',
  preparedBy: 'Philson S. Josol',
  preparedDate: '2026-01-29',
  eventDate: '2026-01-29',
  packageOnePrice: '15000',
  ledWallPrice: '18000',
  orFeePrice: '4000',
  transpoFeePrice: '2000',
}

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

const createInitialSections = () =>
  SAMPLE_OBJECT_ARRAY.map((section) => ({
    ...section,
    equipment: [...section.equipment].sort(
      (a, b) => typeOrder[a.type] - typeOrder[b.type],
    ),
  }))

const InvoiceBuilderContext = createContext<
  InvoiceBuilderContextValue | undefined
>(undefined)

export const InvoiceBuilderProvider = ({ children }: PropsWithChildren) => {
  const [formValues, setFormValues] =
    useState<InvoiceFormValues>(initialFormValues)
  const [sections, setSections] =
    useState<LabelAndEquipmentProps[]>(createInitialSections)

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (!saved) return

    try {
      const parsed = JSON.parse(saved) as {
        formValues?: InvoiceFormValues
        sections?: LabelAndEquipmentProps[]
      }

      if (parsed.formValues) {
        setFormValues({ ...initialFormValues, ...parsed.formValues })
      }

      if (parsed.sections) {
        setSections(parsed.sections)
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ formValues, sections }),
    )
  }, [formValues, sections])

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCheckClick = (sectionId: number, id: number) => {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) return section

        return {
          ...section,
          equipment: section.equipment.map((item) =>
            section.singleSelect
              ? { ...item, isChecked: item.id === id ? !item.isChecked : false }
              : item.id === id
                ? { ...item, isChecked: !item.isChecked }
                : item,
          ),
        }
      }),
    )
  }

  const value = useMemo(
    () => ({
      formValues,
      sections,
      handleFieldChange,
      handleCheckClick,
    }),
    [formValues, sections],
  )

  return (
    <InvoiceBuilderContext.Provider value={value}>
      {children}
    </InvoiceBuilderContext.Provider>
  )
}

export const useInvoiceBuilder = () => {
  const context = useContext(InvoiceBuilderContext)

  if (!context) {
    throw new Error(
      'useInvoiceBuilder must be used within an InvoiceBuilderProvider',
    )
  }

  return context
}
