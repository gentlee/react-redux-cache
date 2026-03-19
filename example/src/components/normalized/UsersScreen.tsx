import {Link} from 'react-router-dom'

import {NormalizedCache} from '../../cache/types'

export const UsersScreenNormalized = ({cache}: {cache: NormalizedCache}) => {
  const rootPath = window.location.pathname.split('/').slice(0, -1).join('/')

  const {
    hooks: {useQuery, useEntitiesByTypename},
  } = cache

  const [{result: usersResult, loading, error, params}, fetchUsers] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const refreshing = loading && params?.page === 1
  const loadingNextPage = loading && !refreshing

  const usersMap = useEntitiesByTypename('users')

  console.debug('[UsersScreenNormalized]', {
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
      <p>
        denormalized:{' '}
        <span id="denormalized">{JSON.stringify(usersResult?.items.map((id) => usersMap![id]))}</span>
      </p>
      {refreshing && <div className="spinner" />}
      {usersResult?.items.map((userId: number) => {
        return (
          <Link id={'user-link-' + userId} key={userId} className={'link'} to={rootPath + '/user/' + userId}>
            {usersMap![userId].name}
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
