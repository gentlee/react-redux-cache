import {Link} from 'react-router-dom'

import {zustandNotNormalizedOptimized} from './cache'

const {
  hooks: {useQuery},
} = zustandNotNormalizedOptimized

export const UsersScreenZustandNotNormalizedOptimized = () => {
  const [{result: users, loading, error, params}, fetchUsers] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const refreshing = loading && params?.page === 1
  const loadingNextPage = loading && !refreshing

  console.debug('[ZustandNormalized/UsersScreen]', {
    users,
    loading,
    error,
  })

  if (loading && !users) {
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
        getUsers result: '<span id="result">{JSON.stringify(users)}</span>
      </p>
      {refreshing && <div className="spinner" />}
      {users?.items.map((user) => {
        return (
          <Link
            id={'user-link-' + user.id}
            key={user.id}
            className={'link'}
            to={'/zustand-not-normalized-optimized/user/' + user.id}
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
            const lastLoadedPage = users?.page ?? 0
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
