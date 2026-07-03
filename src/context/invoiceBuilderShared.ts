import { createContext, type ChangeEvent } from 'react'
import type { LabelAndEquipmentProps } from '../components/Form/components/list-checker/listCheckerProps'
import type { InvoiceFormValues } from './invoiceBuilderConfig'

export type InvoiceBuilderContextValue = {
  activePackageId: string | null
  formValues: InvoiceFormValues
  sections: LabelAndEquipmentProps[]
  handleFieldChange: (event: ChangeEvent<HTMLInputElement>) => void
  handleCheckClick: (sectionId: string, id: string) => void
  addCustomSection: () => void
  removeCustomSection: (sectionId: string) => void
  addCustomItem: (sectionId: string, name: string) => void
  removeCustomItem: (sectionId: string, itemId: string) => void
  updateCustomSectionPrice: (sectionId: string, price: string) => void
  selectPackageTemplate: (packageId: string) => boolean
  resetInvoiceBuilder: () => void
}

export const InvoiceBuilderContext = createContext<
  InvoiceBuilderContextValue | undefined
>(undefined)
