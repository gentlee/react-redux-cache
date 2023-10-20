import logo from './logo.svg'
import './App.css'
import {Provider} from 'react-redux'
import {PERSIST_ENABLED, persistor, store} from './redux/store'
import {BrowserRouter, Link, Route, Routes} from 'react-router-dom'
import {getUsers, getUsersSchema} from './api/getUsers'
import {UserScreen} from './components/UserScreen'
import {PersistGate} from 'redux-persist/integration/react'
import {useDenormalizeSelector, useQuery} from './redux/cache'

const RootScreen = () => {
  const [{result, loading, error}, fetch] = useQuery({
    query: getUsers,
    params: {
      page: 1,
    },
  })

  const denormalizedResult = useDenormalizeSelector(result, getUsersSchema, ['users'])

  console.log('[RootScreen]', {
    result,
    loading,
    error,
    denormalizedResult,
  })

  if (loading && !result) {
    return (
      <div className="App">
        <p>Loading</p>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{'getUsers result: ' + JSON.stringify(result)}</p>
        <p>{'getUsers denormalized result: ' + JSON.stringify(denormalizedResult)}</p>
        <Link className={'App-link'} to={'/home'}>
          Home
        </Link>
        {result?.array.map((userId: number) => {
          return (
            <Link key={userId} className={'App-link'} to={'/user/' + userId}>
              {'User id: ' + userId}
            </Link>
          )
        })}
        <button
          onClick={() => {
            const lastLoadedPage: number =
              // @ts-ignore page type
              store.getState().queries.getUsers?.['all-pages'].result?.page ?? 0
            fetch({page: lastLoadedPage + 1})
          }}
        >
          Load next page
        </button>
      </header>
    </div>
  )
}

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
