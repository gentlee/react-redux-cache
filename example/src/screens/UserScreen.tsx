import {useParams} from 'react-router-dom'

import logo from '../logo.svg'
import {useMutation, useQuery, useSelectEntityById} from '../redux/cache'

export const UserScreen = () => {
  const {id} = useParams()

  const [{result, loading, error}] = useQuery({
    query: 'getUser',
    cacheOptions: 'cache-first',
    params: {id: Number(id)},
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  const user = useSelectEntityById(result, 'users')
  const bank = useSelectEntityById(user?.bank, 'banks')

  console.log('[UserScreen]', {
    result,
    loading,
    error,
    user,
    bank,
  })

  if (loading) {
    return (
      <div className="App">
        <p>Loading</p>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button
          className="User-screen-update-user-button"
          onClick={() => {
            user &&
              updateUser({
                id: user.id,
                name: user.name + ' *',
              })
          }}
        >{`Updat${updatingUser ? 'ing' : 'e'} user name`}</button>
        <p>{'Result: ' + JSON.stringify(result)}</p>
        <p>{'User: ' + JSON.stringify(user)}</p>
        <p>{'Bank: ' + JSON.stringify(bank)}</p>
      </header>
    </div>
  )
}
