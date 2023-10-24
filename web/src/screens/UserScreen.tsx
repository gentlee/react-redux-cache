import {useParams} from 'react-router-dom'
import logo from '../logo.svg'
import {getUserSchema} from '../api/getUser'
import {useSelectDenormalized, useMutation, useQuery} from '../redux/cache'

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

  const denormalizedResult = useSelectDenormalized(result, getUserSchema, ['users', 'banks'])

  console.log('[UserScreen]', {
    result,
    loading,
    error,
    denormalizedResult,
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
            denormalizedResult &&
              updateUser({
                id: denormalizedResult.id,
                name: denormalizedResult.name + ' *',
              })
          }}
        >{`Updat${updatingUser ? 'ing' : 'e'} user name`}</button>
        <p>{'User result: ' + JSON.stringify(result)}</p>
        <p>{'User denormalized result: ' + JSON.stringify(denormalizedResult)}</p>
      </header>
    </div>
  )
}
