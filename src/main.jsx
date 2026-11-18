/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: main.jsx
 */
import { StrictMode } from 'react'
import './shared/i18n/i18n'
import { createRoot } from 'react-dom/client'
import './shared/styles/bootstrap-isolated.css'
import './index.css'
import './shared/ui/ui.css'
import App from './App.jsx'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, localStoragePersister } from './shared/services/queryClient'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: localStoragePersister,
          maxAge: 1000 * 60 * 60 * 24, // 24h: cache cũ hơn mốc này sẽ bị bỏ qua
        }}
      >
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
  </StrictMode>,
)
