import React, { useState, useEffect } from 'react'
import KinesisVideoViewer from './KinesisVideoViewer'
import MQTTSender from './MQTTSender'

function Dashboard({ signOut, user }) {
  const [keysPressed, setKeysPressed] = useState({
    a: 0,
    w: 0,
    s: 0,
    d: 0,
    shift: 0,
  })

  // Key event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['a', 'w', 's', 'd', 'Shift'].includes(e.key)) {
        setKeysPressed((prevKeys) => ({
          ...prevKeys,
          [e.key.toLowerCase()]: 1,
        }))
      }
    }

    const handleKeyUp = (e) => {
      if (['a', 'w', 's', 'd', 'Shift'].includes(e.key)) {
        setKeysPressed((prevKeys) => ({
          ...prevKeys,
          [e.key.toLowerCase()]: 0,
        }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Function to generate button styles based on key state
  const getKeyStyle = (key) => ({
    backgroundColor: keysPressed[key] ? 'orange' : 'lightgray',
    margin: '5px',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
  })

  return (
    <>
      <h1>Dashboard - Hello {user.username}</h1>
      <button onClick={signOut}>Sign out</button>
      <KinesisVideoViewer />

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '20px',
        }}
      >
        <button style={getKeyStyle('shift')}>Shift</button>
        <div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={getKeyStyle('w')}>W</button>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '10px',
            }}
          >
            <button style={getKeyStyle('a')}>A</button>
            <button style={getKeyStyle('s')}>S</button>
            <button style={getKeyStyle('d')}>D</button>
          </div>
        </div>
      </div>

      <MQTTSender keysPressed={keysPressed} />
    </>
  )
}

export default Dashboard
