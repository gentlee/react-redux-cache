import {useMemo} from 'react'
import logo from './logo.svg'
import './App.css'
import {cache} from './cache/cache'
import {Provider, useSelector} from 'react-redux'
import {useQuery} from './redux-cache'
import {persistor, store} from './redux/store'
import {BrowserRouter, Link, Route, Routes} from 'react-router-dom'
import {denormalize} from 'normalizr'
import {getUsersSchema} from './api/getUsers'
import {UserScreen} from './components/UserScreen'
import {PersistGate} from 'redux-persist/integration/react'

const RootScreen = () => {
  const [{data, loading, error}, fetch] = useQuery({
    query: 'getUsers',
    params: {
      // @ts-ignore
      page: 1,
    },
    cacheOptions: 'cache-first',
    getParamsKey: (params) => params?.page ?? 0,
    getCacheKey: () => 'all-pages',
    // @ts-ignore
    mergeResults: (oldData, newData) => {
      if (!oldData || newData.page === 1) {
        return newData
      }
      return {
        ...newData,
        array: [...oldData.array, ...newData.array],
      }
    },
    // @ts-ignore
    cache,
  })

  // @ts-ignore
  const entities = useSelector((state) => state.entities)

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
              // @ts-ignore lastPage
              store.getState().queries.getUsers?.['all-pages'].data?.page ?? 0
            // @ts-ignore
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
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootScreen />} />
            <Route path="/home" element={<RootScreen />} />
            <Route path="/user/:id" element={<UserScreen />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
}

export default App
