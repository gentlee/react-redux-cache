import {Link} from 'react-router-dom'

import {selectEntitiesByTypename, useQuery} from './cache'
import {useStore} from './store'

const selectUsers = (state: unknown) => selectEntitiesByTypename(state, 'users')

export const UsersScreenZustand = () => {
  const [{result: usersResult, loading, error, params}, fetchUsers] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const refreshing = loading && params?.page === 1
  const loadingNextPage = loading && !refreshing

  const usersMap = useStore(selectUsers)

  console.debug('[UsersScreenZustand]', {
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
      <p>
        denormalized:{' '}
        <span id="denormalized">{JSON.stringify(usersResult?.items.map((id) => usersMap![id]))}</span>
      </p>
      {refreshing && <div className="spinner" />}
      {usersResult?.items.map((userId: number) => {
        return (
          <Link id={'user-link-' + userId} key={userId} className={'link'} to={'/zustand/user/' + userId}>
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
