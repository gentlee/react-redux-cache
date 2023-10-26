import '../App.css'

import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

import logo from '../logo.svg'
import {entitiesByTypenameSelector, useQuery} from '../redux/cache'
import {store} from '../redux/store'

export const RootScreen = () => {
  const [{result: usersResult, loading, error}, fetch] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const usersMap = useSelector(entitiesByTypenameSelector('users'))

  console.log('[RootScreen]', {
    usersResult,
    loading,
    error,
  })

  if (loading && !usersResult) {
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
        <p>{'getUsers result: ' + JSON.stringify(usersResult)}</p>
        <p>
          {'getUsers denormalized: ' + JSON.stringify(usersResult?.array.map((id) => usersMap[id]))}
        </p>
        <Link className={'App-link'} to={'/home'}>
          Home
        </Link>
        {usersResult?.array.map((userId: number) => {
          return (
            <Link key={userId} className={'App-link'} to={'/user/' + userId}>
              {'User id: ' + userId}
            </Link>
          )
        })}
        <button
          onClick={() => {
            const lastLoadedPage: number =
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
