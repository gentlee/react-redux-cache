import React, {useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {cacheNotNormalized} from './cache'

export const UserScreen = () => {
  const {id: userIdParam} = useParams()

  const [userId, setUserId] = useState(Number(userIdParam))
  const [skip, setSkip] = useState(false)

  const [{result: user, loading, error}] = cacheNotNormalized.hooks.useQuery({
    query: 'getUser',
    params: userId,
    skip,
  })

  const [updateUser, {loading: updatingUser}] = cacheNotNormalized.hooks.useMutation({
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

  return (
    <div className="screen">
      <Link id={'users-link'} className={'link'} to={'/not-normalized/users'}>
        {'users'}
      </Link>
      <button
        id="update-user"
        onClick={() => {
          user &&
            updateUser({
              id: user.id,
              name: user.name + ' *',
            })
        }}
      >{`updat${updatingUser ? 'ing' : 'e'} user name`}</button>
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
