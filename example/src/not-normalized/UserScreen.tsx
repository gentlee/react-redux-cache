import {useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {cacheNotNormalized} from './cache'

export const UserScreen = () => {
  const {
    hooks: {useQuery, useMutation},
  } = cacheNotNormalized

  const {id: userIdParam} = useParams()
  const [skip, setSkip] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const userId = +userIdParam!

  const [{result: user, loading, error}, refetchUser] = useQuery({
    query: 'getUser',
    cachePolicy: 'cache-and-fetch',
    params: userId,
    skip: skip || isNaN(userId),
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

    if (result) {
      refetchUser()
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
      <Link id="next-user" className="link" to={'/not-normalized/user/' + String(userId + 1)}>
        next user
      </Link>
      {userId > 0 && (
        <Link id="next-user" className="link" to={'/not-normalized/user/' + String(userId - 1)}>
          previous user
        </Link>
      )}
      <div className="checkbox">
        <input id="skip" type="checkbox" checked={skip} onChange={() => setSkip(!skip)} />
        <label>skip</label>
      </div>
      <p>
        user: <span id="user">{JSON.stringify(user)}</span>
      </p>
      <p>
        bank: <span id="bank">{JSON.stringify(user?.bank)}</span>
      </p>
    </div>
  )
}
