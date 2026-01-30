import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import App from "./App.tsx"
import { LevitationDemoPage } from "@/pages/LevitationDemoPage"
import { BatteriesDemoPage } from "@/pages/BatteriesDemoPage"
import "./index.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Navigate to="/levitation" replace />} />
          <Route path="/levitation" element={<LevitationDemoPage />} />
          <Route path="/batteries" element={<BatteriesDemoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
