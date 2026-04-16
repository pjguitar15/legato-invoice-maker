import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { InvoiceBuilderProvider } from './context/InvoiceBuilderContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InvoiceBuilderProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </InvoiceBuilderProvider>
  </StrictMode>,
)
