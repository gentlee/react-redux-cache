import { denormalize } from "normalizr"
import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { cache } from "../cache/cache"
import { useQuery } from "../redux-cache"
import logo from '../logo.svg'
import { getUserSchema } from "../api/getUser"
import { useSelector } from "react-redux"

export const UserScreen = () => {
  const { id } = useParams()

  const [{ data, loading, error }] = useQuery({
    query: 'getUser',
    cacheOptions: 'cache-first',
    // @ts-ignore
    params: { id },
    cache,
  })

  // @ts-ignore
  const entities = useSelector((state) => state.entities)

  const denormalizedData = useMemo(() => denormalize(data, getUserSchema, entities), [data, entities])
  
  console.log('[App]', { data, status: loading, error })

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
        <p>
          {'User data: ' + JSON.stringify(data)}
        </p>
        <p>
          {'User denormalized data: ' + JSON.stringify(denormalizedData)}
        </p>
      </header>
    </div>
  );
}
