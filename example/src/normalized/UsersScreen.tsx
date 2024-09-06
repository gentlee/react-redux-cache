import React from 'react'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

import {entitiesByTypenameSelector, useClient, useQuery} from './cache'

export const UsersScreen = () => {
  const {query} = useClient()

  const [{result: usersResult, loading, error}] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const usersMap = useSelector(entitiesByTypenameSelector('users'))

  console.debug('[UsersScreen]', {
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
      <p>
        denormalized:{' '}
        <span id="denormalized">
          {JSON.stringify(usersResult?.items.map((id) => usersMap[id]))}
        </span>
      </p>
      <Link id="users-link" className={'link'} to={'/'}>
        home
      </Link>
      {usersResult?.items.map((userId: number) => {
        return (
          <Link id={'user-link-' + userId} key={userId} className={'link'} to={'/user/' + userId}>
            {'user ' + userId}
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
