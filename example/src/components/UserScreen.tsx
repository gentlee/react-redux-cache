import React, {useState} from 'react'
import {useParams} from 'react-router-dom'

import {useMutation, useQuery, useSelectEntityById} from '../utils/redux/cache'

export const UserScreen = () => {
  const {id: userIdParam} = useParams()
  const [userId, setUserId] = useState(Number(userIdParam))

  const [{result, loading, error}] = useQuery({
    query: 'getUser',
    cacheOptions: 'cache-first',
    params: userId,
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
        <button
          id="next-user"
          className="User-screen-update-user-button"
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setUserId((prev) => prev! + 1)
          }}
        >
          Next user
        </button>
        <button
          id="prev-user"
          className="User-screen-update-user-button"
          disabled={userId === 0}
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setUserId((prev) => prev! - 1)
          }}
        >
          Previous user
        </button>
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
