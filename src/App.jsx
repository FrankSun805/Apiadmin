import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import UsageCheck from './components/UsageCheck'
import ImageGenTest from './components/ImageGenTest'
import ChatUsage from './components/ChatUsage'
import Login from './components/Login'

function App() {
  // Default keys provided by user
  const DEFAULT_LICENSE_KEY = 'sk-7C1E3G5I7K9M1O3Q5S7U9W1Y3A5C7E9G1I3'
  const DEFAULT_CHAT_KEY = 'sk-rdQKORUaBAAUHoKSwYvSECSY9AVX9hwvLWvH1EUahR6fMdEY'

  const [licenseToken, setLicenseToken] = useState(DEFAULT_LICENSE_KEY)
  const [chatToken, setChatToken] = useState(DEFAULT_CHAT_KEY)
  const [activeTab, setActiveTab] = useState('usage')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  useEffect(() => {
    // Check auth status
    const isAuth = localStorage.getItem('sparkeo_auth') === 'true'
    setIsAuthenticated(isAuth)

    // Load persisted tokens or fallback to defaults
    const savedLicense = localStorage.getItem('license_token')
    const savedChat = localStorage.getItem('chat_token')

    // Migration: check old 'user_token' if specific keys missing
    const oldGenericToken = localStorage.getItem('user_token')

    if (savedLicense) {
      setLicenseToken(savedLicense)
    } else if (oldGenericToken && oldGenericToken.startsWith('sk-7C')) {
      setLicenseToken(oldGenericToken)
    }

    if (savedChat) {
      setChatToken(savedChat)
    }

    setIsAuthChecking(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem('sparkeo_auth', 'true')
  }

  const handleTokenChange = (val) => {
    if (activeTab === 'chatusage') {
      setChatToken(val)
      localStorage.setItem('chat_token', val)
    } else {
      setLicenseToken(val)
      localStorage.setItem('license_token', val)
    }
  }

  // Determine which token to show in the header input
  const activeToken = activeTab === 'chatusage' ? chatToken : activeTab === 'imggen' ? licenseToken : licenseToken

  if (isAuthChecking) return null // Or a loading spinner

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      token={activeToken}
      onTokenChange={handleTokenChange}
    >
      {activeTab === 'usage' ? (
        <UsageCheck token={licenseToken} />
      ) : activeTab === 'imggen' ? (
        <ImageGenTest token={licenseToken} />
      ) : (
        <ChatUsage token={chatToken} />
      )}
    </Layout>
  )
}

export default App
