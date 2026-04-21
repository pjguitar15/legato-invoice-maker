import { useContext } from 'react'
import { InvoiceBuilderContext } from './invoiceBuilderShared'

export const useInvoiceBuilder = () => {
  const context = useContext(InvoiceBuilderContext)

  if (!context) {
    throw new Error(
      'useInvoiceBuilder must be used within an InvoiceBuilderProvider',
    )
  }

  return context
}
