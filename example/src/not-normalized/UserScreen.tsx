import {useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {cacheNotNormalized} from './cache'

export const UserScreen = () => {
  const {
    hooks: {useQuery, useMutation},
  } = cacheNotNormalized

  const {id: userIdParam} = useParams()
  const [skip, setSkip] = useState(false)

  const userId = +userIdParam!

  const [{result: user, loading, error}, refetchUser] = useQuery({
    query: 'getUser',
    params: userId,
    skip: skip || isNaN(userId),
  })

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
        {'Users'}
      </Link>
      {!!user && (
        <button id="update-user" onClick={onUpdateUserNameClick}>{`Updat${
          updatingUser ? 'ing' : 'e'
        } user name`}</button>
      )}
      <Link id="next-user" className="link" to={'/not-normalized/user/' + String(userId + 1)}>
        Next user
      </Link>
      {userId > 0 && (
        <Link id="next-user" className="link" to={'/not-normalized/user/' + String(userId - 1)}>
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
