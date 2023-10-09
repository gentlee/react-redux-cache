import {denormalize} from 'normalizr'
import {useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {useMutation, useQuery} from '../redux-cache'
import logo from '../logo.svg'
import {getUserSchema} from '../api/getUser'
import {useSelector} from 'react-redux'
import {cache} from '../redux/cache'
import {ReduxState} from '../redux/store'

export const UserScreen = () => {
  const {id} = useParams()

  const [{data, loading, error}] = useQuery(cache, {
    query: 'getUser',
    cacheOptions: 'cache-first',
    params: {id: Number(id)},
  })

  const [updateUser, {loading: updatingUser}] = useMutation(cache, {
    mutation: 'updateUser',
  })

  const entities = useSelector((state: ReduxState) => state.entities)

  const denormalizedData = useMemo(
    () => denormalize(data, getUserSchema, entities),
    [data, entities]
  )

  console.log('[App]', {data, status: loading, error})

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
            data &&
              updateUser({
                id: Number(id),
                // @ts-ignore TODO dataSelector
                name: data.name + ' *',
              })
          }}
        >{`Updat${updatingUser ? 'ing' : 'e'} user name`}</button>
        <p>{'User data: ' + JSON.stringify(data)}</p>
        <p>{'User denormalized data: ' + JSON.stringify(denormalizedData)}</p>
      </header>
    </div>
  )
}
