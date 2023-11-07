import './App.css'

import React from 'react'
import {Provider} from 'react-redux'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {PersistGate} from 'redux-persist/integration/react'

import {createReduxStore} from '../test-utils/redux/store'
import {RootScreen} from './RootScreen'
import {UserScreen} from './UserScreen'

export const App = ({
  persistEnabled = false,
  reduxLoggerEnabled = false,
}: {
  persistEnabled?: boolean
  reduxLoggerEnabled?: boolean
}) => {
  const {store, persistor} = createReduxStore(persistEnabled, reduxLoggerEnabled)

  const router = (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootScreen />} />
        <Route path="/home" element={<RootScreen />} />
        <Route path="/user/:id" element={<UserScreen />} />
      </Routes>
    </BrowserRouter>
  )

  return (
    <Provider store={store}>
      {persistEnabled ? (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        <PersistGate loading={null} persistor={persistor!}>
          {router}
        </PersistGate>
      ) : (
        router
      )}
    </Provider>
  )
}
