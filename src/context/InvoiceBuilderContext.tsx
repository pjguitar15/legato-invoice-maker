import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type PropsWithChildren,
} from 'react'
import type { LabelAndEquipmentProps } from '../components/Form/components/list-checker/listCheckerProps'
import {
  CUSTOM_PACKAGE_ID,
  createInitialFormValues,
  createFormValuesForTemplate,
  createSectionsForTemplate,
  getPackageTemplate,
  mergeSectionsWithBase,
  type InvoiceFormValues,
} from './invoiceBuilderConfig'
import { InvoiceBuilderContext } from './invoiceBuilderShared'

const STORAGE_KEY = 'legato-invoice-builder'

type StoredInvoiceBuilderState = {
  activePackageId: string | null
  formValues: InvoiceFormValues
  sections: LabelAndEquipmentProps[]
}

const createInitialState = (): StoredInvoiceBuilderState => {
  const baseFormValues = createInitialFormValues()
  const baseState: StoredInvoiceBuilderState = {
    activePackageId: null,
    formValues: baseFormValues,
    sections: mergeSectionsWithBase(),
  }

  if (typeof window === 'undefined') {
    return baseState
  }

  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return baseState
  }

  try {
    const parsed = JSON.parse(saved) as Partial<StoredInvoiceBuilderState>

    return {
      activePackageId:
        typeof parsed.activePackageId === 'string' ? parsed.activePackageId : null,
      formValues: {
        ...baseFormValues,
        ...parsed.formValues,
      },
      sections: mergeSectionsWithBase(parsed.sections),
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return baseState
  }
}

export const InvoiceBuilderProvider = ({ children }: PropsWithChildren) => {
  const [initialState] = useState(createInitialState)
  const [activePackageId, setActivePackageId] = useState<string | null>(
    initialState.activePackageId,
  )
  const [formValues, setFormValues] = useState<InvoiceFormValues>(
    initialState.formValues,
  )
  const [sections, setSections] = useState<LabelAndEquipmentProps[]>(
    initialState.sections,
  )

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ activePackageId, formValues, sections }),
    )
  }, [activePackageId, formValues, sections])

  const handleFieldChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }, [])

  const handleCheckClick = useCallback((sectionId: string, id: string) => {
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
  }, [])

  const selectPackageTemplate = useCallback((packageId: string) => {
    if (!getPackageTemplate(packageId)) {
      return false
    }

    const nextSections = createSectionsForTemplate(packageId)
    const nextFormValues = createFormValuesForTemplate(packageId)

    setActivePackageId(packageId)
    setFormValues(nextFormValues)
    setSections(nextSections)

    return true
  }, [])

  const resetInvoiceBuilder = useCallback(() => {
    setActivePackageId(CUSTOM_PACKAGE_ID)
    setFormValues(createInitialFormValues())
    setSections(mergeSectionsWithBase())
  }, [])

  const value = useMemo(
    () => ({
      activePackageId,
      formValues,
      sections,
      handleFieldChange,
      handleCheckClick,
      selectPackageTemplate,
      resetInvoiceBuilder,
    }),
    [
      activePackageId,
      formValues,
      sections,
      handleFieldChange,
      handleCheckClick,
      selectPackageTemplate,
      resetInvoiceBuilder,
    ],
  )

  return (
    <InvoiceBuilderContext.Provider value={value}>
      {children}
    </InvoiceBuilderContext.Provider>
  )
}
