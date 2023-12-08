import React, {useState} from 'react'
import {useParams} from 'react-router-dom'

import {useMutation, useQuery, useSelectEntityById} from '../redux/cache'

export const UserScreen = () => {
  const {id: userIdParam} = useParams()

  const [userId, setUserId] = useState(Number(userIdParam))
  const [skip, setSkip] = useState(false)

  const [{result, loading, error}] = useQuery({
    query: 'getUser',
    params: userId,
    skip,
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  const user = useSelectEntityById(result, 'users')
  const bank = useSelectEntityById(user?.bankId, 'banks')

  console.debug('[UserScreen]', {
    result,
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
      <div className="App">
        <p id="loading">loading</p>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <button
          id="update-user"
          className="User-screen-update-user-button"
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
          className="User-screen-update-user-button"
          onClick={() => {
            setUserId(userId + 1)
          }}
        >
          next user
        </button>
        <button
          id="prev-user"
          className="User-screen-update-user-button"
          disabled={userId === 0}
          onClick={() => {
            setUserId(userId - 1)
          }}
        >
          previous user
        </button>
        <div>
          <input id="skip" type="checkbox" checked={skip} onChange={() => setSkip(!skip)} />
          <label> skip</label>
        </div>
        <p>
          getUser result: <span id="result">{JSON.stringify(result)}</span>
        </p>
        <p>
          user: <span id="user">{JSON.stringify(user)}</span>
        </p>
        <p>
          bank: <span id="bank">{JSON.stringify(bank)}</span>
        </p>
      </header>
    </div>
  )
}
