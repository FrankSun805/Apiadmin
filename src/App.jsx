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
    // If saved token exists and is NOT the old default, use it. Otherwise use the new default.
    const oldDefault = 'sk-7C1E3G5I7K9M1O3Q5S7U9W1Y3A5C7E9G1I3'
    if (savedToken && savedToken !== oldDefault) {
      setToken(savedToken)
    } else {
      // Force update to new token if local storage has old default or is empty
      const newToken = 'sk-rdQKORUaBAAUHoKSwYvSECSY9AVX9hwvLWvH1EUahR6fMdEY'
      setToken(newToken)
      localStorage.setItem('user_token', newToken)
    }
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
