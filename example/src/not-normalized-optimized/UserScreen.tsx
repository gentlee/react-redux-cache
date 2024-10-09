import {useState} from 'react'
import {defaultGetCacheKey} from 'react-redux-cache'
import {Link, useParams} from 'react-router-dom'

import {useAppStore} from '../redux/store'
import {cacheNotNormalizedOptimized} from './cache'

export const UserScreen = () => {
  const {
    actions: {updateQueryStateAndEntities},
    hooks: {useQuery, useMutation},
    selectors: {selectQueryState},
  } = cacheNotNormalizedOptimized

  const {dispatch, getState} = useAppStore()
  const {id: userIdParam} = useParams()
  const [skip, setSkip] = useState(false)

  const userId = +userIdParam!

  const [{result: user, loading, error}] = useQuery({
    query: 'getUser',
    params: userId,
    skip: skip || isNaN(userId),
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  console.debug('[NotNormalizedOptimized/UserScreen]', {
    result: user,
    loading,
    error,
    user,
    userId,
    skip,
  })

  if (loading) {
    return (
      <div className="screen">
        <div className="spinner" />
      </div>
    )
  }

  const onUpdateUserNameClick = async () => {
    if (!user) {
      return
    }

    const {result} = await updateUser({
      id: user.id,
      name: user.name + ' *',
    })
    // Updating getUser and getUsers results after successfull mutation.
    // Refetch instead can be used, but this will cause additional requests.
    // Normalization approach does that automatically.
    if (result) {
      // Update getUser result
      dispatch(updateQueryStateAndEntities('getUser', defaultGetCacheKey(result.id), {result}))

      // Update getUsers result
      const getUsersState = selectQueryState(getState(), 'getUsers', 'all-pages')
      if (getUsersState) {
        const userIndex = getUsersState.result?.items.findIndex((x) => x.id === result.id)
        if (getUsersState.result && userIndex != null && userIndex != -1) {
          const newUsersResult = {
            ...getUsersState.result,
            items: [...getUsersState.result.items],
          }
          newUsersResult.items.splice(userIndex, 1, result)
          dispatch(updateQueryStateAndEntities('getUsers', 'all-pages', {result: newUsersResult}))
        }
      }
    }
  }

  return (
    <div className="screen">
      <Link id={'users-link'} className={'link'} to={'/not-normalized-optimized/users'}>
        {'Users'}
      </Link>
      {!!user && (
        <button id="update-user" onClick={onUpdateUserNameClick}>{`Updat${
          updatingUser ? 'ing' : 'e'
        } user name`}</button>
      )}
      <Link id="next-user" className="link" to={'/not-normalized-optimized/user/' + String(userId + 1)}>
        Next user
      </Link>
      {userId > 0 && (
        <Link id="next-user" className="link" to={'/not-normalized-optimized/user/' + String(userId - 1)}>
          Previous user
        </Link>
      )}
      <div className="checkbox">
        <input id="skip" type="checkbox" checked={skip} onChange={() => setSkip(!skip)} />
        <label>skip</label>
      </div>
      <p>
        User: <span id="user">{JSON.stringify(user)}</span>
      </p>
      <p>
        Bank: <span id="bank">{JSON.stringify(user?.bank)}</span>
      </p>
    </div>
  )
}
