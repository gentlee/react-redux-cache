import React from 'react'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

import {entitiesByTypenameSelector, useQuery} from '../utils/redux/cache'

export const RootScreen = () => {
  const [{result: usersResult, loading, error}, fetch] = useQuery({
    query: 'getUsers',
    params: {
      page: 1,
    },
  })

  const usersMap = useSelector(entitiesByTypenameSelector('users'))

  console.debug('[RootScreen]', {
    usersResult,
    loading,
    error,
  })

  if (loading && !usersResult) {
    return (
      <div className="App">
        <p id="loading">loading</p>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          getUsers result: '<span id="result">{JSON.stringify(usersResult)}</span>
        </p>
        <p>
          denormalized:{' '}
          <span id="denormalized">
            {JSON.stringify(usersResult?.items.map((id) => usersMap[id]))}
          </span>
        </p>
        <Link id="home-link" className={'App-link'} to={'/home'}>
          home
        </Link>
        {usersResult?.items.map((userId: number) => {
          return (
            <Link
              id={'user-link-' + userId}
              key={userId}
              className={'App-link'}
              to={'/user/' + userId}
            >
              {'user ' + userId}
            </Link>
          )
        })}
        <button
          id="load-next-page"
          onClick={() => {
            const lastLoadedPage: number = usersResult?.page ?? 0
            fetch({page: lastLoadedPage + 1})
          }}
        >
          load next page
        </button>
      </header>
    </div>
  )
}
