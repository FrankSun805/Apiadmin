import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import UsageCheck from './components/UsageCheck'
import ImageGenTest from './components/ImageGenTest'
import ChatUsage from './components/ChatUsage'

function App() {
  const [token, setToken] = useState('sk-rdQKORUaBAAUHoKSwYvSECSY9AVX9hwvLWvH1EUahR6fMdEY')
  const [activeTab, setActiveTab] = useState('usage')

  useEffect(() => {
    const savedToken = localStorage.getItem('user_token')
    if (savedToken) setToken(savedToken)
  }, [])

  const handleTokenChange = (val) => {
    setToken(val)
    localStorage.setItem('user_token', val)
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      token={token}
      onTokenChange={handleTokenChange}
    >
      {activeTab === 'usage' ? (
        <UsageCheck token={token} />
      ) : activeTab === 'imggen' ? (
        <ImageGenTest token={token} />
      ) : (
        <ChatUsage token={token} />
      )}
    </Layout>
  )
}

export default App
