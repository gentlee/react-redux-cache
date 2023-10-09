import {useMemo} from 'react'
import logo from './logo.svg'
import './App.css'
import {Provider, useSelector} from 'react-redux'
import {PERSIST_ENABLED, ReduxState, persistor, store} from './redux/store'
import {BrowserRouter, Link, Route, Routes} from 'react-router-dom'
import {denormalize} from 'normalizr'
import {getUsersSchema} from './api/getUsers'
import {UserScreen} from './components/UserScreen'
import {PersistGate} from 'redux-persist/integration/react'
import {useQuery} from './redux-cache/useQuery'
import {cache} from './redux/cache'

const RootScreen = () => {
  const [{data, loading, error}, fetch] = useQuery(cache, {
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const entities = useSelector((state: ReduxState) => state.entities)

  const denormalizedData = useMemo(() => {
    console.log('[RootScreen] denormalize', {data, entities})
    return denormalize(data, getUsersSchema, entities)
  }, [data, entities])

  console.log('[RootScreen]', {data, status: loading, error, denormalizedData})

  if (loading && !data) {
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
        <p>{'getUsers data: ' + JSON.stringify(data)}</p>
        <p>{'getUsers denormalized data: ' + JSON.stringify(denormalizedData)}</p>
        <Link className={'App-link'} to={'/home'}>
          Home
        </Link>
        {data?.array.map((userId: number) => {
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
              store.getState().queries.getUsers?.['all-pages'].data?.page ?? 0
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
