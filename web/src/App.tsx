import { useMemo } from 'react';
import logo from './logo.svg';
import './App.css';
import { cache } from './cache/cache';
import { Provider, useSelector } from 'react-redux';
import { useQuery } from './redux-cache';
import { persistor, store } from './redux/store';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { denormalize } from 'normalizr';
import { getUsersSchema } from './api/getUsers';
import { UserScreen } from './components/UserScreen';
import { PersistGate } from 'redux-persist/integration/react';

const RootScreen = () => {
  const [{ data, loading, error }] = useQuery({
    query: 'getUsers',
    cacheOptions: 'cache-first',
    // @ts-ignore
    cache,
  })

  // @ts-ignore
  const entities = useSelector((state) => state.entities)

  const denormalizedData = useMemo(() => denormalize(data, getUsersSchema, entities), [data, entities])
  
  console.log('[App]', { data, status: loading, error })

  if (loading) {
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
        <p>
          {'getUsers data: ' + JSON.stringify(data)}
        </p>
        <p>
          {'getUsers denormalized data: ' + JSON.stringify(denormalizedData)}
        </p>
        <Link className={'App-link'} to={'/home'}>Home</Link>
        {data?.array.map((userId: number) => {
          console.log('[user link]', userId)
          return <Link key={userId} className={'App-link'} to={'/user/' + userId}>{'User id: ' + userId}</Link>
        })}
      </header>
    </div>
  );
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
};

export default App
