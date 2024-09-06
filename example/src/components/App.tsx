import './App.css'

import {Provider} from 'react-redux'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {PersistGate} from 'redux-persist/integration/react'

import {UserScreen} from '../normalized/UserScreen'
import {UsersScreen} from '../normalized/UsersScreen'
import {UserScreen as UserScreenNotNormalized} from '../not-normalized/UserScreen'
import {UsersScreen as UsersScreenNotNormalized} from '../not-normalized/UsersScreen'
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
      </Routes>
    </BrowserRouter>
  )

  return (
    <Provider store={store}>
      {persistEnabled ? (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        <PersistGate loading={<p>Rehydrating</p>} persistor={persistor!}>
          {router}
        </PersistGate>
      ) : (
        router
      )}
    </Provider>
  )
}
