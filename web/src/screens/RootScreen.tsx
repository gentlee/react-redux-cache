import logo from '../logo.svg'
import '../App.css'
import {store} from '../redux/store'
import {Link} from 'react-router-dom'
import {getUsersSchema} from '../api/getUsers'
import {useSelectDenormalized, useQuery} from '../redux/cache'

export const RootScreen = () => {
  const [{result, loading, error}, fetch] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const denormalizedResult = useSelectDenormalized(result, getUsersSchema, ['users'])

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
