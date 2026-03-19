import './App.css'

import {Provider} from 'react-redux'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {PersistGate} from 'redux-persist/integration/react'

import {mutableNormalized} from '../cache/redux/mutable-normalized'
import {normalized} from '../cache/redux/normalized'
import {notNormalized} from '../cache/redux/not-normalized'
import {notNormalizedOptimized} from '../cache/redux/not-normalized-optimized'
import {createReduxStore} from '../cache/redux/store'
import {zustandNormalized} from '../cache/zustand/normalized'
import {zustandNotNormalizedOptimized} from '../cache/zustand/not-normalized-optimized'
import {UserScreenNormalized} from './normalized/UserScreen'
import {UsersScreenNormalized} from './normalized/UsersScreen'
import {UserScreenNotNormalized as UserScreenNotNormalized} from './not-normalized/UserScreen'
import {UsersScreenNotNormalized as UsersScreenNotNormalized} from './not-normalized/UsersScreen'
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

        {/* Normalized */}

        <Route path="/users" element={<UsersScreenNormalized cache={normalized} />} />
        <Route path="/user/:id" element={<UserScreenNormalized cache={normalized} />} />
        <Route path="/mutable/users" element={<UsersScreenNormalized cache={mutableNormalized} />} />
        <Route path="/mutable/user/:id" element={<UserScreenNormalized cache={mutableNormalized} />} />
        <Route
          path="/zustand-normalized/users"
          element={<UsersScreenNormalized cache={zustandNormalized} />}
        />
        <Route
          path="/zustand-normalized/user/:id"
          element={<UserScreenNormalized cache={zustandNormalized} />}
        />

        {/* Not normalized */}

        <Route path="/not-normalized/users" element={<UsersScreenNotNormalized cache={notNormalized} />} />
        <Route path="/not-normalized/user/:id" element={<UserScreenNotNormalized cache={notNormalized} />} />
        <Route
          path="/not-normalized-optimized/users"
          element={<UsersScreenNotNormalized cache={notNormalizedOptimized} />}
        />
        <Route
          path="/not-normalized-optimized/user/:id"
          element={<UserScreenNotNormalized cache={notNormalizedOptimized} />}
        />
        <Route
          path="/zustand-not-normalized-optimized/users"
          element={<UsersScreenNotNormalized cache={zustandNotNormalizedOptimized} />}
        />
        <Route
          path="/zustand-not-normalized-optimized/user/:id"
          element={<UserScreenNotNormalized cache={zustandNotNormalizedOptimized} />}
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
