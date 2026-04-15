import { Route, Routes } from 'react-router'
import './App.css'
import CreateInvoice from './pages/CreateInvoice'
import ReviewInvoice from './pages/ReviewInvoice'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<CreateInvoice />} />
        <Route path='/review-invoice' element={<ReviewInvoice />} />
      </Routes>
    </>
  )
}

export default App
