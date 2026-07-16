import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import App from "./App.tsx"
import { LevitationDemoPage } from "@/pages/LevitationDemoPage"
import { BatteriesDemoPage } from "@/pages/BatteriesDemoPage"
import { PropulsionDemoPage } from "@/pages/PropulsionDemoPage"
import { GeneralStateDemoPage } from "@/pages/GeneralStateDemoPage"
import "./index.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Navigate to="/state" replace />} />
          <Route path="/levitation" element={<LevitationDemoPage />} />
          <Route path="/batteries" element={<BatteriesDemoPage />} />
          <Route path="/propulsion" element={<PropulsionDemoPage />} />
          <Route path="/state" element={<GeneralStateDemoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
