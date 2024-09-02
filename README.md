### Donations 🙌

**BTC:** bc1qs0sq7agz5j30qnqz9m60xj4tt8th6aazgw7kxr \
**ETH:** 0x1D834755b5e889703930AC9b784CB625B3cd833E \
**USDT(Tron):** TPrCq8LxGykQ4as3o1oB8V7x1w2YPU2o5n \
**TON:** EQAtBuFWI3H_LpHfEToil4iYemtfmyzlaJpahM3tFSoxojvV \
**DOGE:** D7GMQdKhKC9ymbT9PtcetSFTQjyPRRfkwT

# react-redux-cache

**Powerful** yet **lightweight** data fetching and caching library that supports **normalization** unlike `react-query` and `rtk-query`, while having similar but very simple interface. Built on top of `redux`, fully typed and written on Typescript. Can be considered as `ApolloClient` for protocols other than `GraphQL`.

**Normalization** is the best way to keep the state of the app **consistent** between different views, reduces the number of fetches and allows to show cached data when navigating, which greatly improves **user experience**.

Remains **full control** of redux state with ability to write custom selectors, actions and reducers to manage cached state.
    
### Table of contents

 - [Installation](https://github.com/gentlee/react-redux-cache#Installation)
 - [Initialization](https://github.com/gentlee/react-redux-cache#Initialization)
   - [cache.ts](https://github.com/gentlee/react-redux-cache#cachets) 
   - [store.ts](https://github.com/gentlee/react-redux-cache#storets) 
   - [api.ts](https://github.com/gentlee/react-redux-cache#apits) 
 - [Usage](https://github.com/gentlee/react-redux-cache#usage)
 - [Advanced](https://github.com/gentlee/react-redux-cache#advanced)
   - [resultSelector](https://github.com/gentlee/react-redux-cache#resultselector)
   - [Infinite scroll pagination](https://github.com/gentlee/react-redux-cache#infinite-scroll-pagination)
   - [redux-persist](https://github.com/gentlee/react-redux-cache#redux-persist)
 - [FAQ](https://github.com/gentlee/react-redux-cache#faq)
   - [What is a query cache key?](https://github.com/gentlee/react-redux-cache#what-is-a-query-cache-key)
   - [How mutation fetching differs from queries?](https://github.com/gentlee/react-redux-cache#how-mutation-fetching-differs-from-queries)

### Installation
`react`, `redux` and `react-redux` are peer dependencies.
```sh
npm add react-redux-cache react redux react-redux
```
### Initialization
The only function that needs to be imported is `createCache`, which creates fully typed reducer, hooks, actions, selectors and utils to be used in the app. Only **single** cache reducer per store is supported currenlty.
All typenames, queries and mutations should be passed while initializing the cache for proper typing.
#### cache.ts
```typescript
export const {
  cache,
  reducer,
  hooks: {useClient, useMutation, useQuery, useSelectEntityById},
  // Actions, selectors and utils may be not used at all
  selectors: {entitiesSelector, entitiesByTypenameSelector},
  actions: {
    updateQueryStateAndEntities,
    updateMutationStateAndEntities,
    mergeEntityChanges,
    clearQueryState,
    clearMutationState,
  },
  utils: {applyEntityChanges},
} = createCache({
  // Used as prefix for actions and in default cacheStateSelector for selecting cache state from redux state.
  name: 'cache',
  // Typenames provide a mapping of all typenames to their entity types, which is needed for proper typing and normalization.
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
// Create store as usual, passing the new cache reducer under the name of the cache.
// If some other redux structure is needed, provide custom cacheStateSelector when creating cache.
const store = configureStore({
  reducer: {
    [cache.name]: reducer,
    ...
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

Please check `example/` folder (`npm run example` to run).

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

#### resultSelector

By default result of a query is stored under its **cache key**, but sometimes it makes sense to take result from other queries or normalized entities.

For example when single `User` entity is requested by `userId` for the first time, the entity can already be in the cache after `getUsers` query finished.

For that case `resultSelector` can be used:

```typescript

// createCache

... = createCache({
  ...
  queries: {
    ...
    getUser: {
      query: getUser,
      resultSelector: (state, id) => state.entities.users[id]?.id, // <-- Result is selected from cached entities
    },
  },
})

// component

export const UserScreen = () => {
  ...

  // When screen mounts for the first time, query is not fetched
  // and cached value is returned if user entity was already in the cache
  const [{result, loading, error}] = useQuery({
    query: 'getUser',
    params: userId,
  })

  ...
}

```

#### Infinite scroll pagination

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

### FAQ

#### What is a query cache key?

**Cache key** is used for storing the query state and for performing a fetch when it changes. Queries with the same cache key share their state.

Default implementation for `getCacheKey` is:
```typescript
export const defaultGetCacheKey = <P = unknown>(params: P): Key => {
  switch (typeof params) {
    case 'string':
    case 'symbol':
      return params
    case 'object':
      return JSON.stringify(params)
    default:
      return String(params)
  }
}
```

It is recommended to override it when default implementation is not optimal or when keys in params object can be sorted in random order.

As example, can be overriden when implementing pagination.

#### How mutation fetching differs from queries?

**Queries:** For each cache key (= unique params by default) of each query fetch is running in parallel. If fetch is already running for specific cache key, all next fetches are cancelled until it finishes.

**Mutations:** Only one mutation can be run for each mutation key at a time. If another one called, previous is aborted.
