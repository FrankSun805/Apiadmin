import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import UsageCheck from './components/UsageCheck'
import ImageGenTest from './components/ImageGenTest'
import ChatUsage from './components/ChatUsage'

function App() {
  const [token, setToken] = useState('sk-7C1E3G5I7K9M1O3Q5S7U9W1Y3A5C7E9G1I3')
  const [activeTab, setActiveTab] = useState('usage')

  useEffect(() => {
    const savedToken = localStorage.getItem('user_token')
    // If saved token exists, use it. But we want to prefer the hardcoded one for this session if it's the old invalid one.
    // Actually, simplify: just respect saved token if present, otherwise default.
    // To FORCE the user's requested token, we can just set it:
    if (savedToken !== 'sk-7C1E3G5I7K9M1O3Q5S7U9W1Y3A5C7E9G1I3') {
      const newToken = 'sk-7C1E3G5I7K9M1O3Q5S7U9W1Y3A5C7E9G1I3'
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
