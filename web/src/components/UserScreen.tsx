import {useParams} from 'react-router-dom'
import logo from '../logo.svg'
import {getUser, getUserSchema} from '../api/getUser'
import {useDenormalizeSelector, useMutation, useQuery} from '../redux/cache'
import {updateUser as updateUserMutation} from '../api/updateUser'

export const UserScreen = () => {
  const {id} = useParams()

  const [{result, loading, error}] = useQuery({
    query: getUser,
    cacheOptions: 'cache-first',
    params: {id: Number(id)},
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: updateUserMutation,
  })

  const denormalizedResult = useDenormalizeSelector(result, getUserSchema, ['users', 'banks'])

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
