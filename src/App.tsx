import { Navigate, Route, Routes } from 'react-router'
import './App.css'
import BusinessManager from './pages/BusinessManager'
import CreateInvoice from './pages/CreateInvoice'
import PackageTemplateSelection from './pages/PackageTemplateSelection'
import ReviewInvoice from './pages/ReviewInvoice'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<ProtectedRoute><BusinessManager /></ProtectedRoute>} />
        <Route path='/invoice-templates' element={<ProtectedRoute><PackageTemplateSelection /></ProtectedRoute>} />
        <Route path='/package/:packageId' element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
        <Route path='/package/:packageId/review' element={<ProtectedRoute><ReviewInvoice /></ProtectedRoute>} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  )
}

export default App
