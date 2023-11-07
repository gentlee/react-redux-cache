import React from 'react'
import {useParams} from 'react-router-dom'

import {useMutation, useQuery, useSelectEntityById} from '../test-utils/redux/cache'

export const UserScreen = () => {
  const {id} = useParams()

  const [{result: userId, loading, error}] = useQuery({
    query: 'getUser',
    cacheOptions: 'cache-first',
    params: Number(id),
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  const user = useSelectEntityById(userId, 'users')
  const bank = useSelectEntityById(user?.bankId, 'banks')

  console.debug('[UserScreen]', {
    result: userId,
    loading,
    error,
    user,
    bank,
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
        >{`Updat${updatingUser ? 'ing' : 'e'} user name`}</button>
        <p>
          getUser result: <span id="result">{JSON.stringify(userId)}</span>
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
