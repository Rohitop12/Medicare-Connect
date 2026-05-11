import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { NotificationProvider } from './context/NotificationContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
