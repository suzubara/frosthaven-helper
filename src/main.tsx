import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router'
import './index.css'
import App from './App.tsx'
import HomePage from '@/features/home/HomePage'
import ScenarioPage from '@/features/scenario/ScenarioPage'
import CampaignListPage from '@/features/campaign/CampaignListPage'
import CampaignPage from '@/features/campaign/CampaignPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="scenario" element={<ScenarioPage />} />
          <Route path="campaigns" element={<CampaignListPage />} />
          <Route path="campaign/:id" element={<CampaignPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
