import './App.css'
import {Provider} from 'react-redux'
import {PERSIST_ENABLED, persistor, store} from './redux/store'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {UserScreen} from './screens/UserScreen'
import {PersistGate} from 'redux-persist/integration/react'
import {RootScreen} from './screens/RootScreen'

const App = () => {
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
      {PERSIST_ENABLED ? (
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

export default App
