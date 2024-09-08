import {useState} from 'react'
import {defaultGetCacheKey} from 'react-redux-cache'
import {Link, useParams} from 'react-router-dom'

import {useAppStore} from '../redux/store'
import {cacheNotNormalized} from './cache'

export const UserScreen = () => {
  const {
    actions: {updateQueryStateAndEntities},
    hooks: {useQuery, useMutation},
  } = cacheNotNormalized

  const {dispatch, getState} = useAppStore()
  const {id: userIdParam} = useParams()

  const [userId, setUserId] = useState(Number(userIdParam))
  const [skip, setSkip] = useState(false)

  const [{result: user, loading, error}] = useQuery({
    query: 'getUser',
    params: userId,
    skip,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  console.debug('[NotNormalized/UserScreen]', {
    result: user,
    loading,
    error,
    user,
    userId,
    userIdParam,
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
      dispatch(
        updateQueryStateAndEntities('getUser', defaultGetCacheKey(result.id), {
          result,
        })
      )

      // Update getUsers result
      const getUsersState = getState().cacheNotNormalized.queries.getUsers['all-pages']
      if (getUsersState) {
        const userIndex = getUsersState.result?.items.findIndex((x) => x.id === result.id)
        if (getUsersState.result && userIndex != null && userIndex != -1) {
          const newUsersResult = {
            ...getUsersState.result,
            items: [...getUsersState.result.items],
          }
          newUsersResult.items.splice(userIndex, 1, result)
          dispatch(
            updateQueryStateAndEntities('getUsers', 'all-pages', {
              result: newUsersResult,
            })
          )
        }
      }
    }
  }

  return (
    <div className="screen">
      <Link id={'users-link'} className={'link'} to={'/not-normalized/users'}>
        {'users'}
      </Link>
      {!!user && (
        <button id="update-user" onClick={onUpdateUserNameClick}>{`updat${
          updatingUser ? 'ing' : 'e'
        } user name`}</button>
      )}
      <button
        id="next-user"
        onClick={() => {
          setUserId(userId + 1)
        }}
      >
        next user
      </button>
      <button
        id="prev-user"
        disabled={userId === 0}
        onClick={() => {
          setUserId(userId - 1)
        }}
      >
        previous user
      </button>
      <div className="checkbox">
        <input id="skip" type="checkbox" checked={skip} onChange={() => setSkip(!skip)} />
        <label>skip</label>
      </div>
      <p>
        getUser result: <span id="result">{JSON.stringify(user)}</span>
      </p>
      <p>
        user: <span id="user">{JSON.stringify(user)}</span>
      </p>
      <p>
        bank: <span id="bank">{JSON.stringify(user?.bank)}</span>
      </p>
    </div>
  )
}
