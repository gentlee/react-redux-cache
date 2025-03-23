import './App.css'

import {Provider} from 'react-redux'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {PersistGate} from 'redux-persist/integration/react'

import {UserScreen} from '../normalized/UserScreen'
import {UsersScreen} from '../normalized/UsersScreen'
import {UserScreenZustand} from '../normalized-zustand/UserScreen'
import {UsersScreenZustand} from '../normalized-zustand/UsersScreen'
import {UserScreen as UserScreenNotNormalized} from '../not-normalized/UserScreen'
import {UsersScreen as UsersScreenNotNormalized} from '../not-normalized/UsersScreen'
import {UserScreen as UserScreenNotNormalizedOptimized} from '../not-normalized-optimized/UserScreen'
import {UsersScreen as UsersScreenNotNormalizedOptimized} from '../not-normalized-optimized/UsersScreen'
import {createReduxStore} from '../redux/store'
import {RootScreen} from './RootScreen'

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
        <Route path="/users" element={<UsersScreen />} />
        <Route path="/user/:id" element={<UserScreen />} />
        <Route path="/not-normalized/users" element={<UsersScreenNotNormalized />} />
        <Route path="/not-normalized/user/:id" element={<UserScreenNotNormalized />} />
        <Route path="/not-normalized-optimized/users" element={<UsersScreenNotNormalizedOptimized />} />
        <Route path="/not-normalized-optimized/user/:id" element={<UserScreenNotNormalizedOptimized />} />
        <Route path="/zustand/users" element={<UsersScreenZustand />} />
        <Route path="/zustand/user/:id" element={<UserScreenZustand />} />
      </Routes>
    </BrowserRouter>
  )

  return (
    <Provider store={store}>
      {persistEnabled ? (
        <PersistGate loading={<p>Rehydrating</p>} persistor={persistor!}>
          {router}
        </PersistGate>
      ) : (
        router
      )}
    </Provider>
  )
}
