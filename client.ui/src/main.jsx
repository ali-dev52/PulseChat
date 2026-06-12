import { createRoot } from 'react-dom/client'
import Elecrto from './Elecrto'
import { AuthProvider } from './context/auth'
import { SocketProvider } from './context/socket'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <SocketProvider>
      <Elecrto />
    </SocketProvider>
  </AuthProvider>
)