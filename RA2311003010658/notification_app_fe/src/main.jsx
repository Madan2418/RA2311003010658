import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import AllNotifications from './pages/AllNotifications.jsx'
import PriorityNotifications from './pages/PriorityNotifications.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<AllNotifications />} />
          <Route path="priority" element={<PriorityNotifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
