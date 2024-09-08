import {Link} from 'react-router-dom'

import {User} from './api/types'
import {cacheNotNormalized} from './cache'

export const UsersScreen = () => {
  const {
    hooks: {useQuery, useClient},
  } = cacheNotNormalized

  const {query} = useClient()

  const [{result: usersResult, loading, error}] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  console.debug('[NotNormalized/UsersScreen]', {
    usersResult,
    loading,
    error,
  })

  if (loading && !usersResult) {
    return (
      <div className="screen">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="screen">
      <p>
        getUsers result: '<span id="result">{JSON.stringify(usersResult)}</span>
      </p>
      <Link id="users-link" className={'link'} to={'/'}>
        home
      </Link>
      {usersResult?.items.map((user: User) => {
        return (
          <Link
            id={'user-link-' + user.id}
            key={user.id}
            className={'link'}
            to={'/not-normalized/user/' + user.id}
          >
            {'user ' + user.id}
          </Link>
        )
      })}
      {loading ? (
        <div className="spinner" />
      ) : (
        <button
          id="load-next-page"
          onClick={() => {
            const lastLoadedPage = usersResult?.page ?? 0
            query({
              query: 'getUsers',
              params: {page: lastLoadedPage + 1},
            })
          }}
        >
          load next page
        </button>
      )}
    </div>
  )
}
