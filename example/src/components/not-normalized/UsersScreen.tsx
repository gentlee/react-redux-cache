import {Link} from 'react-router-dom'

import {User} from '../../backend/not-normalized/types'
import {NotNormalizedCache} from '../../cache/types'

export const UsersScreenNotNormalized = ({cache}: {cache: NotNormalizedCache}) => {
  const rootPath = window.location.pathname.split('/').slice(0, -1).join('/')

  const {
    hooks: {useQuery},
  } = cache

  const [{result: usersResult, loading, error, params}, fetchUsers] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const refreshing = loading && params?.page === 1
  const loadingNextPage = loading && !refreshing

  console.debug('[UsersScreenNotNormalized]', {
    rootPath,
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
        getUsers result: <span id="result">{JSON.stringify(usersResult)}</span>
      </p>
      {refreshing && <div className="spinner" />}
      {usersResult?.items.map((user: User) => {
        return (
          <Link
            id={'user-link-' + user.id}
            key={user.id}
            className={'link'}
            to={rootPath + '/user/' + user.id}
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
