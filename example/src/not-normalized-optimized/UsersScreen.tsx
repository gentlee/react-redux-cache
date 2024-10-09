import {Link} from 'react-router-dom'

import {User} from '../not-normalized/api/types'
import {cacheNotNormalizedOptimized} from './cache'

export const UsersScreen = () => {
  const {
    hooks: {useQuery},
  } = cacheNotNormalizedOptimized

  const [{result: usersResult, loading, error, params}, fetchUsers] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const refreshing = loading && params?.page === 1
  const loadingNextPage = loading && !refreshing

  console.debug('[NotNormalizedOptimized/UsersScreen]', {
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
      <Link id="users-link" className={'link'} to={'/'}>
        Home
      </Link>
      <p>
        getUsers result: '<span id="result">{JSON.stringify(usersResult)}</span>
      </p>
      {refreshing && <div className="spinner" />}
      {usersResult?.items.map((user: User) => {
        return (
          <Link
            id={'user-link-' + user.id}
            key={user.id}
            className={'link'}
            to={'/not-normalized-optimized/user/' + user.id}
          >
            {user.name}
          </Link>
        )
      })}
      {loadingNextPage ? (
        <div className="spinner" />
      ) : (
        <button
          id="load-next-page"
          onClick={() => {
            const lastLoadedPage = usersResult?.page ?? 0
            fetchUsers({
              params: {page: lastLoadedPage + 1},
            })
          }}
        >
          Load next page
        </button>
      )}
    </div>
  )
}
