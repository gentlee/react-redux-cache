# react-redux-cache

**Powerful** yet **lightweight** data fetching and caching library that supports **normalization** unlike `react-query` and `rtk-query`, while having similar but very simple interface. Built on top of `redux`, fully typed and written on Typescript. Can be considered as `ApolloClient` for protocols other than `GraphQL`.

**Normalization** is the best way to keep the state of the app **consistent** between different views, reduces the number of fetches and allows to show cached data when navigating, which greatly improves **user experience**.

Remains **full control** of redux state with ability to write custom selectors, actions and reducers to manage cached state.
    
Usage example can be found in `example/` folder and run by `npm run example` command from the root folder.
    
### Table of contents

 - [Installation](https://github.com/gentlee/react-redux-cache#Installation)
 - [Initialization](https://github.com/gentlee/react-redux-cache#Initialization)
   - [cache.ts](https://github.com/gentlee/react-redux-cache#cachets) 
   - [store.ts](https://github.com/gentlee/react-redux-cache#storets) 
   - [api.ts](https://github.com/gentlee/react-redux-cache#apits) 
 - [Usage](https://github.com/gentlee/react-redux-cache#usage)
 - [Advanced](https://github.com/gentlee/react-redux-cache#advanced)
   - [redux-persist](https://github.com/gentlee/react-redux-cache#redux-persist)

### Installation
`react`, `redux` and `react-redux` are peer dependencies.
```sh
npm add react-redux-cache react redux react-redux
```
### Initialization
The only function that needs to be imported is `createCache`, which creates fully typed reducer, hooks, actions, selectors and utils to be used in the app.
All typenames, queries and mutations should be passed while initializing the cache for proper typing.
#### cache.ts
```typescript
export const {
  reducer,
  hooks: {useClient, useMutation, useQuery, useSelectEntityById},
  // Actions, selectors and utils may be not used at all
  selectors: {entitiesSelector, entitiesByTypenameSelector},
  actions: {setQueryStateAndEntities, setMutationStateAndEntities, mergeEntityChanges},
  utils: {applyEntityChanges},
} = createCache({
  // This selector should return the cache state based on the path to its reducer.
  cacheStateSelector: (state) => state.cache,
  // Typenames provide a mapping of all typenames to their entity types, which is needed for normalization.
  // Empty objects with type casting can be used as values.
  typenames: {
    users: {} as User, // here `users` entities will have type `User`
    banks: {} as Bank,
  },
  queries: {
    getUsers: { query: getUsers },
    getUser: { query: getUser },
  },
  mutations: {
    updateUser: { mutation: updateUser },
    removeUser: { mutation: removeUser },
  },
})
```
#### store.ts
```typescript
// Create store as usual, passing the new cache reducer
// under the key, previously used in cacheStateSelector
const store = configureStore({
  reducer: {
    cache: reducer,
  }
})
```
#### api.ts
Query result should be of type `QueryResponse`, mutation result should be of type `MutationResponse`.
For normalization `normalizr` package is used in this example, but any other tool can be used if query result is of proper type.
Perfect implementation is when the backend already returns normalized data.
```typescript

// Example of query with normalization (recommended)

export const getUser = async (id: number) => {
  const result = await ...
  
  const normalizedResult: {
     // result is id of the user
    result: number
    // entities contain all normalized objects 
    entities: {
      users: Record<number, User>
      banks: Record<string, Bank>
    }
  } = normalize(result, getUserSchema)

  return normalizedResult
}

// Example of query without normalization (not recommended)

export const getBank = (id: string) => {
  const result: Bank = ...
  return {result} // result is bank object, no entities passed
}

// Example of mutation with normalization

export const removeUser = async (id: number) => {
  await ...
  return {
    remove: { users: [id] },
  }
}
```

### Usage
#### UserScreen.tsx
```typescript
export const UserScreen = () => {
  const {id} = useParams()

  // useQuery connects to redux state and if user with that id is already cached, fetch won't happen (with default cachePolicy 'cache-first')
  // Infers all types from created cache, telling here that params and result are of type `number`.
  const [{result: userId, loading, error}] = useQuery({
    query: 'getUser',
    params: Number(id),
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  // This selector is used for denormalization and returns entities with proper types - User and Bank
  const user = useSelectEntityById(userId, 'users')
  const bank = useSelectEntityById(user?.bankId, 'banks')

  if (loading) {
    return ...
  }

  return ...
}
```

### Advanced

#### Pagination

Here is an example of `getUsers` query configuration with pagination support. You can check full implementation in `/example` folder.

```typescript
// createCache

...
} = createCache({
  ...
  queries: {
    getUsers: {
      query: getUsers,
      getCacheKey: () => 'all-pages', // single cache key is used for all pages
      mergeResults: (oldResult, {result: newResult}) => {
        if (!oldResult || newResult.page === 1) {
          return newResult
        }
        if (newResult.page === oldResult.page + 1) {
          return {
            ...newResult,
            items: [...oldResult.items, ...newResult.items],
          }
        }
        return oldResult
      },
    },
  },
  ...
})

// Component

export const GetUsersScreen = () => {
  const {query} = useClient()

  const [{result: usersResult, loading, error}, refetch] = useQuery({
    query: 'getUsers',
    params: 1 // page
  })

  const onLoadNextPage = () => {
    const lastLoadedPage = usersResult?.page ?? 0
    query({
      query: 'getUsers',
      params: lastLoadedPage + 1,
    })
  }

  const renderUser = (userId: number) => (
    <UserRow key={userId} userId={userId}>
  )

  ...

  return (
    <div>
      {usersResult?.items.map(renderUser)}
      <button onClick={refetch}>Refresh</button>
      <button onClick={onLoadNextPage}>Load next page</button>
    </div>
  )
}

```

#### redux-persist

Here is a simple `redux-persist` configuration:

```typescript
// removes `loading` and `error` from persisted state
function stringifyReplacer(key: string, value: unknown) {
  return key === 'loading' || key === 'error' ? undefined : value
}

const persistedReducer = persistReducer(
  {
    key: 'cache',
    storage,
    whitelist: ['entities', 'queries'], // mutations are ignored
    throttle: 1000, // ms
    serialize: (value: unknown) => JSON.stringify(value, stringifyReplacer),
  },
  reducer
)
```
