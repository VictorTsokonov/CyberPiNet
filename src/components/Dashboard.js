import React from 'react'
import KinesisVideoViewer from './KinesisVideoViewer'

function Dashboard({ signOut, user }) {
  return (
    <>
      <h1>Dashboard - Hello {user.username}</h1>
      <button onClick={signOut}>Sign out</button>
      <KinesisVideoViewer />
    </>
  )
}

export default Dashboard
