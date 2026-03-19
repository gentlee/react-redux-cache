import './App.css'

import {Provider} from 'react-redux'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {PersistGate} from 'redux-persist/integration/react'

import {UserScreen as UserScreenMutableNormalized} from '../redux/mutable-normalized/UserScreen'
import {UsersScreen as UsersScreenMutableNormalized} from '../redux/mutable-normalized/UsersScreen'
import {UserScreen} from '../redux/normalized/UserScreen'
import {UsersScreen} from '../redux/normalized/UsersScreen'
import {UserScreen as UserScreenNotNormalized} from '../redux/not-normalized/UserScreen'
import {UsersScreen as UsersScreenNotNormalized} from '../redux/not-normalized/UsersScreen'
import {UserScreen as UserScreenNotNormalizedOptimized} from '../redux/not-normalized-optimized/UserScreen'
import {UsersScreen as UsersScreenNotNormalizedOptimized} from '../redux/not-normalized-optimized/UsersScreen'
import {createReduxStore} from '../redux/store'
import {UserScreenZustandNormalized} from '../zustand/normalized/UserScreen'
import {UsersScreenZustandNormalized} from '../zustand/normalized/UsersScreen'
import {UserScreenZustandNotNormalizedOptimized} from '../zustand/not-normalized-optimized/UserScreen'
import {UsersScreenZustandNotNormalizedOptimized} from '../zustand/not-normalized-optimized/UsersScreen'
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
        <Route path="/mutable/users" element={<UsersScreenMutableNormalized />} />
        <Route path="/mutable/user/:id" element={<UserScreenMutableNormalized />} />
        <Route path="/not-normalized/users" element={<UsersScreenNotNormalized />} />
        <Route path="/not-normalized/user/:id" element={<UserScreenNotNormalized />} />
        <Route path="/not-normalized-optimized/users" element={<UsersScreenNotNormalizedOptimized />} />
        <Route path="/not-normalized-optimized/user/:id" element={<UserScreenNotNormalizedOptimized />} />
        <Route path="/zustand-normalized/users" element={<UsersScreenZustandNormalized />} />
        <Route path="/zustand-normalized/user/:id" element={<UserScreenZustandNormalized />} />
        <Route
          path="/zustand-not-normalized-optimized/users"
          element={<UsersScreenZustandNotNormalizedOptimized />}
        />
        <Route
          path="/zustand-not-normalized-optimized/user/:id"
          element={<UserScreenZustandNotNormalizedOptimized />}
        />
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
