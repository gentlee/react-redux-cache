<details>
  <summary>Donations 🙌</summary>
  <b>BTC:</b> bc1qs0sq7agz5j30qnqz9m60xj4tt8th6aazgw7kxr <br>
  <b>ETH:</b> 0x1D834755b5e889703930AC9b784CB625B3cd833E <br>
  <b>USDT(Tron):</b> TPrCq8LxGykQ4as3o1oB8V7x1w2YPU2o5n <br>
  <b>TON:</b> EQAtBuFWI3H_LpHfEToil4iYemtfmyzlaJpahM3tFSoxojvV <br>
  <b>DOGE:</b> D7GMQdKhKC9ymbT9PtcetSFTQjyPRRfkwT <br>
</details>

# react-redux-cache (RRC)

### Supports both `Redux` and `Zustand` (check /example)

**Powerful**, **performant** yet **lightweight** data fetching and caching library that supports **normalization** unlike `React Query` and `RTK-Query`, while having similar but not over-engineered, simple interface. Another advantage over `RTK-Query` is that it **doesn't use Immer** ([perf issue](https://github.com/reduxjs/redux-toolkit/issues/4793)). Covered with tests, fully typed and written on Typescript.

**Normalization** is the best way to keep the state of the app **consistent** between different views, reduces the number of fetches and allows to show cached data when navigating, which greatly improves **user experience**.

Can be considered as `ApolloClient` for protocols other than `GraphQL`, but with **full control** over its storage - redux or zustand store, with ability to write custom selectors, actions and reducers to manage cached state.

Examples of states, generated by cache reducer from `/example` project:
<details>
  <summary>
    Normalized
  </summary>
  
  ```js
  {
    entities: {
      // each typename has its own map of entities, stored by id
      users: {
        "0": {id: 0, bankId: "0", name: "User 0 *"},
        "1": {id: 1, bankId: "1", name: "User 1 *"},
        "2": {id: 2, bankId: "2", name: "User 2"},
        "3": {id: 3, bankId: "3", name: "User 3"}
      },
      banks: {
        "0": {id: "0", name: "Bank 0"},
        "1": {id: "1", name: "Bank 1"},
        "2": {id: "2", name: "Bank 2"},
        "3": {id: "3", name: "Bank 3"}
      }
    },
    queries: {
      // each query has its own map of query states, stored by cache key, which is generated from query params
      getUser: {
        "2": {result: 2, params: 2, expiresAt: 1727217298025},
        "3": {loading: true, params: 3}
      },
      getUsers: {
        // example of paginated state under custom cache key
        "all-pages": {
          result: {items: [0,1,2], page: 1},
          params: {page: 1}
        }
      }
    },
    mutations: {
      // each mutation has its own state as well
      updateUser: {
        result: 1,
        params: {id: 1, name: "User 1 *"}
      } 
    }
  }
  ```
</details>

<details>
  <summary>
    Not normalized
  </summary>
  
  ```js
  {
    // entities map is used for normalization and is empty here
    entities: {},
    queries: {
      // each query has its own map of query states, stored by cache key, which is generated from query params
      getUser: {
        "2": {
          result: {id: 2, bank: {id: "2", name: "Bank 2"}, name: "User 2"},
          params: 2,
          expiresAt: 1727217298025
        },
        "3": {loading: true, params: 3}
      },
      getUsers: {
        // example of paginated state under custom cache key
        "all-pages": {
          result: {
            items: [
              {id: 0, bank: {id: "0", name: "Bank 0"}, name: "User 0 *"},
              {id: 1, bank: {id: "1", name: "Bank 1"}, name: "User 1 *"},
              {id: 2, bank: {id: "2", name: "Bank 2"}, name: "User 2"}
            ],
            page: 1
          },
          params: {page: 1}
        }
      }
    },
    mutations: {
      // each mutation has its own state as well
      updateUser: {
        result: {id: 1, bank: {id: "1", name: "Bank 1"}, name: "User 1 *"},
        params: {id: 1, name: "User 1 *"}
      } 
    }
  }
  ```
</details>
    
### Table of contents

 - [Installation](https://github.com/gentlee/react-redux-cache#Installation)
 - [Initialization](https://github.com/gentlee/react-redux-cache#Initialization)
   - [cache.ts](https://github.com/gentlee/react-redux-cache#cachets) 
   - [store.ts](https://github.com/gentlee/react-redux-cache#storets) 
   - [api.ts](https://github.com/gentlee/react-redux-cache#apits) 
 - [Usage](https://github.com/gentlee/react-redux-cache#usage)
 - [Advanced](https://github.com/gentlee/react-redux-cache#advanced)
   - [Error handling](https://github.com/gentlee/react-redux-cache#error-handling)
   - [Invalidation](https://github.com/gentlee/react-redux-cache#invalidation)
   - [Extended & custom fetch policy](https://github.com/gentlee/react-redux-cache#extended--custom-fetch-policy)
   - [Infinite scroll pagination](https://github.com/gentlee/react-redux-cache#infinite-scroll-pagination)
   - [redux-persist](https://github.com/gentlee/react-redux-cache#redux-persist)
 - [FAQ](https://github.com/gentlee/react-redux-cache#faq)
   - [What is a query cache key?](https://github.com/gentlee/react-redux-cache#what-is-a-query-cache-key)
   - [How race conditions are handled?](https://github.com/gentlee/react-redux-cache#how-race-conditions-are-handled)

### Installation
`react` is a peer dependency.

`react-redux` and `fast-deep-equal` are optional peer dependencies:
  - `react-redux` required when `storeHooks` is not provided when creating cache. Not needed for Zustand.
  - `fast-deep-equal` required if `deepComparisonEnabled` cache option is enabled (default is true).

```sh
# required
npm add react-redux-cache react

# without react-redux
npm add react-redux-cache react fast-deep-equal

# all required and optional peers
npm add react-redux-cache react react-redux fast-deep-equal
```

### Initialization
The only function that needs to be imported is either `withTypenames`, which is needed for normalization, or directly `createCache` if it is not needed. `createCache` creates fully typed reducer, hooks, actions, selectors and utils to be used in the app. You can create as many caches as needed, but keep in mind that normalization is not shared between them.
All queries and mutations should be passed while initializing the cache for proper typing.

#### cache.ts

> Zustand requires additional option - `storeHooks`.

```typescript
// Mapping of all typenames to their entity types, which is needed for proper normalization typing.
// Not needed if normalization is not used.
export type CacheTypenames = {
  users: User, // here `users` entities will have type `User`
  banks: Bank,
}

// `withTypenames` is only needed to provide proper Typenames for normalization - limitation of Typescript.
// `createCache` can be imported directly without `withTypenames`.
export const {
  cache,
  reducer,
  hooks: {useClient, useMutation, useQuery},
} = withTypenames<CacheTypenames>().createCache({
  name: 'cache', // Used as prefix for actions and in default cacheStateSelector for selecting cache state from redux state.
  queries: {
    getUsers: { query: getUsers },
    getUser: {
      query: getUser,
      // For each query `secondsToLive` option can be set, which is used to set expiration date of a cached result when query response is received.
      // After expiration query result is considered invalidated and will be refetched on the next useQuery mount.
      // Can also be set globally in `globals`.
      secondsToLive: 5 * 60 // Here cached result is valid for 5 minutes.
    },
  },
  mutations: {
    updateUser: { mutation: updateUser },
    removeUser: { mutation: removeUser },
  },

  // Required for Zustand. Just an empty object can be passed during initialization, and hooks can be set later (see `store.ts` section).
  // Can be also used for Redux if working with multiple stores.
  storeHooks: {},
})
```

For normalization two things are required:
- Set proper typenames while creating the cache - mapping of all entities and their corresponding TS types.
- Return an object from queries and mutations that contains the following fields (besides `result`):

```typescript
type EntityChanges<T extends Typenames> = {
  merge?: PartialEntitiesMap<T>         /** Entities that will be merged with existing. */
  replace?: Partial<EntitiesMap<T>>     /** Entities that will replace existing. */
  remove?: EntityIds<T>                 /** Ids of entities that will be removed. */
  entities?: EntityChanges<T>['merge']  /** Alias for `merge` to support normalizr. */
}
```

#### store.ts

Redux:
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

Zustand:
```typescript
type State = {[cache.name]: ReturnType<typeof reducer>}
type Actions = {dispatch: (action: CacheAction) => void}
type CacheAction = Parameters<typeof reducer>[1]

const initialState: State = {[cache.name]: reducer(undefined, {} as any)}

export const useStore = create<State & Actions>((set, get) => ({
  ...initialState,
  dispatch: (action: CacheAction) => {
    set({[cache.name]: reducer(get()[cache.name], action)})
  },
}))

const store = {dispatch: useStore.getState().dispatch, getState: useStore.getState}
cache.storeHooks.useStore = () => store
cache.storeHooks.useSelector = useStore
```

#### api.ts
For normalization `normalizr` package is used in this example, but any other tool can be used if query result is of proper type.
Perfect implementation is when the backend already returns normalized data.
```typescript

// Example of query with normalization (recommended)

// 1. Result can be get by any way - fetch, axios etc, even with database connection. There is no limitation here.
// 2. `satisfies` keyword is used here for proper typing of params and returned value.
export const getUser = (async (id) => {
  const response = await ...

  return normalize(response, getUserSchema)
}) satisfies NormalizedQuery<CacheTypenames, number>

// Example of query without normalization (not recommended), with selecting access token from the store

export const getBank = (async (id, {getState}) => {
  const token = tokenSelector(getState())
  const result: Bank = ...
  return {result} // result is bank object, no entities passed
}) satisfies Query<string>

// Example of mutation with normalization

export const removeUser = (async (id, _, abortSignal) => {
  await ...
  return {
    remove: { users: [id] },
  }
}) satisfies NormalizedQuery<CacheTypenames, number>
```

### Usage

Please check `example/` folder (`npm run example` to run). There are examples for both Redux and Zustand.

#### UserScreen.tsx
```typescript
export const UserScreen = () => {
  const {id} = useParams()

  // useQuery connects to redux state and if user with that id is already cached, fetch won't happen (with default FetchPolicy.NoCacheOrExpired).
  // Infers all types from created cache, telling here that params and result are of type `number`.
  const [{result: userId, loading, error}] = useQuery({
    query: 'getUser',
    params: Number(id),
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  // This selector returns entities with proper types - User and Bank
  const user = useSelectEntityById(userId, 'users')
  const bank = useSelectEntityById(user?.bankId, 'banks')

  if (loading) {
    return ...
  }

  return ...
}
```

### Advanced

#### Error handling

Queries and mutations are wrapped in try/catch, so any error will lead to cancelling of any updates to the state except `loading: false` and the caught error. If you still want to make some state updates, or just want to use thrown errors only for unexpected cases, consider returning expected errors as a part of the result:

```typescript
export const updateBank = (async (bank) => {
  const {httpError, response} = ...
  return {
    result: {
      httpError,            // Error is a part of the result, containing e.g. map of not valid fields and threir error messages
      bank: response?.bank  // Bank still can be returned from the backend with error e.g. when only some of fields were udpated
    }
  }
}) satisfies Mutation<Partial<Bank>>
```

If global error handling is needed for errors, not handled by query / mutation `onError` callback, global `onError` can be used:

```typescript
export const cache = createCache({
  name: 'cache',
  globals: {
    onError: (error, key) {
      console.log('Not handled error', { error, key })
    }
  },
  queries: {
    getUsers: { query: getUsers },
  },
  ...
})
```

#### Invalidation

`FetchPolicy.NoCacheOrExpired` (default) skips fetching on fetch triggers if result is already cached, but we can invalidate cached query results using `invalidateQuery` action to make it run again on a next mount.

```typescript

export const cache = createCache({
  ...
  mutations: {
    updateUser: {
      mutation: updateUser,
      onSuccess(_, __, {dispatch}, {invalidateQuery}) {
        // Invalidate getUsers after a single user update (can be done better by updating getUsers state with updateQueryStateAndEntities)
        dispatch(invalidateQuery([{query: 'getUsers'}]))
      },
    },
  },
})
```

#### Extended & custom fetch policy

Fetch policy determines if `useQuery` fetch triggers should start fetching. They are: 1) component mount 2) cache key change (=params by default) 3) `skipFetch` change to false.

`FetchPolicy.NoCacheOrExpired` (default) skips fetching if result is already cached, but sometimes it can't determine that we already have result in some other's query result or in normalized entities cache. In that case we can use `skipFetch` parameter of a query:

```typescript
export const UserScreen = () => {
  ...

  const user = useSelectEntityById(userId, 'users')

  const [{loading, error}] = useQuery({
    query: 'getUser',
    params: userId,
    skipFetch: !!user // Disable fetches if we already have user cached by some other query, e.g. getUsers
  })

  ...
}
```

But if more control is needed, e.g. checking if entity is full, custom fetch policy can be provided:

```typescript
  ...
  getFullUser: {
    query: getUser,
    fetchPolicy(expired, id, _, {getState}, {selectEntityById}) {
      if (expired) {
        return true // fetch if expired
      }

      // fetch if user is not full
      const user = selectEntityById(getState(), id, 'users')
      return !user || !('name' in user) || !('bankId' in user)
    },
  },
  ...
```

One more approach is to set `skipFetch: true` by default and manually run `fetch`. `onlyIfExpired` option can be also used:

```typescript
export const UserScreen = () => {
  const screenIsVisible = useScreenIsVisible()

  const [{result, loading, error}, fetchUser] = useQuery({
    query: 'getUser',
    params: userId,
    skipFetch: true
  })

  useEffect(() => {
    if (screenIsVisible) {
      fetchUser({ onlyIfExpired: true }) // expiration happens if expiresAt was set before e.g. by secondsToLive option or invalidateQuery action. If result is not cached yet, it is also considered as expired.
    }
  }, [screenIsVisible])

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
  const [{result: usersResult, loading, error, params}, fetchUsers] = useQuery({
    query: 'getUsers',
    params: 1 // page
  })

  const refreshing = loading && params === 1
  const loadingNextPage = loading && !refreshing

  const onLoadNextPage = () => {
    const lastLoadedPage = usersResult?.page ?? 0
    fetchUsers({
      params: lastLoadedPage + 1,
    })
  }

  const renderUser = (userId: number) => (
    <UserRow key={userId} userId={userId}>
  )

  ...

  return (
    <div>
      {refreshing && <div className="spinner" />}
      {usersResult?.items.map(renderUser)}
      <button onClick={() => fetchUsers()}>Refresh</button>
      {loadingNextPage ? (
        <div className="spinner" />
      ) : (
        <button onClick={loadNextPage}>Load next page</button>
      )}
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

As example, can be overridden when implementing pagination.

#### How race conditions are handled?

**Queries:** Queries are throttled: query with the same cache key (generated from params by default) is cancelled if already running.

**Mutations:** Mutations are debounced: previous similar mutation is aborted if it was running when the new one started. Third argument in mutations is `AbortSignal`, which can be used e.g. for cancelling http requests.
