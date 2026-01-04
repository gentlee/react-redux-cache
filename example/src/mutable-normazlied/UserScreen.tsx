import {useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {useMutation, useQuery, useSelectEntityById} from './cache'

export const UserScreen = () => {
  const {id: userIdParam} = useParams()

  const [skip, setSkip] = useState(false)

  const userId = +userIdParam!

  const user = useSelectEntityById(userId, 'users')
  const bank = useSelectEntityById(user?.bankId, 'banks')

  const [{loading, error}] = useQuery({
    query: 'getUser',
    params: userId,
    skipFetch: skip || isNaN(userId) || !!user,
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  console.debug('[UserScreen]', {
    loading,
    error,
    user,
    bank,
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
      <Link id={'users-link'} className={'link'} to={'/mutable/users'}>
        {'Users'}
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
      >{`Updat${updatingUser ? 'ing' : 'e'} user name`}</button>
      <Link id="next-user" className="link" to={'/mutable/user/' + String(userId + 1)}>
        Next user
      </Link>
      {userId > 0 && (
        <Link id="next-user" className="link" to={'/mutable/user/' + String(userId - 1)}>
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
        Bank: <span id="bank">{JSON.stringify(bank)}</span>
      </p>
    </div>
  )
}
