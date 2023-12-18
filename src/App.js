import './App.css'
import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom'
import Dashboard from './components/Dashboard'
import { Amplify } from 'aws-amplify'

import { withAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import config from './amplifyconfiguration.json'
Amplify.configure(config)

function App({ signOut, user }) {
  return (
    <Router>
      <Routes>
        <Route
          path='/dashboard'
          element={
            <Dashboard
              signOut={signOut}
              user={user}
            />
          }
        />
        <Route
          path='*'
          element={
            <Navigate
              replace
              to='/dashboard'
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default withAuthenticator(App)
