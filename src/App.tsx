import { Navigate, Route, Routes } from 'react-router'
import './App.css'
import BusinessManager from './pages/BusinessManager'
import CreateInvoice from './pages/CreateInvoice'
import PackageTemplateSelection from './pages/PackageTemplateSelection'
import ReviewInvoice from './pages/ReviewInvoice'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<BusinessManager />} />
        <Route path='/invoice-templates' element={<PackageTemplateSelection />} />
        <Route path='/package/:packageId' element={<CreateInvoice />} />
        <Route path='/package/:packageId/review' element={<ReviewInvoice />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  )
}

export default App
