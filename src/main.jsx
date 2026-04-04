import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 1. Import the Amplify Library AND the Provider
import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css';

// 2. Configure with specific AWS details
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_gwI09WNzq', 
      userPoolClientId: '1re081f4ufs8m9kdcsgs2221s6',
      loginWith: {
        email: true
      }
    }
  },
  API: {
    REST: {
      ElectroTechAPI: {
        endpoint: 'https://rphbveh8mb.execute-api.us-east-1.amazonaws.com/prod',
        region: 'us-east-1'
      }
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Wrap App here so useAuthenticator works everywhere */}
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </StrictMode>,
)
