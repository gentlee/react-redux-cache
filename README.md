<details>
  <summary>Donations 🙌</summary>
  <b>BTC:</b> bc1qs0sq7agz5j30qnqz9m60xj4tt8th6aazgw7kxr <br>
  <b>ETH:</b> 0x1D834755b5e889703930AC9b784CB625B3cd833E <br>
  <b>USDT(Tron):</b> TPrCq8LxGykQ4as3o1oB8V7x1w2YPU2o5n <br>
  <b>TON:</b> EQAtBuFWI3H_LpHfEToil4iYemtfmyzlaJpahM3tFSoxojvV <br>
  <b>DOGE:</b> D7GMQdKhKC9ymbT9PtcetSFTQjyPRRfkwT <br>
</details>

# react-redux-cache (RRC)

**Powerful** yet **lightweight** data fetching and caching library that supports **normalization** unlike `react-query` and `rtk-query`, while having similar but very simple interface. Built on top of `redux`, covered with tests, fully typed and written on Typescript.

**Normalization** is the best way to keep the state of the app **consistent** between different views, reduces the number of fetches and allows to show cached data when navigating, which greatly improves **user experience**.

Can be considered as `ApolloClient` for protocols other than `GraphQL`, but with **full control** over its storage - redux store, with ability to write custom selectors, actions and reducers to manage cached state.

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
        "2": {loading: false, error: undefined, result: 2, params: 2},
        "3": {loading: true, params: 3}
      },
      getUsers: {
        // example of paginated state under custom cache key
        "all-pages": {
          loading: false,
          result: {items: [0,1,2], page: 1},
          params: {page: 1}
        }
      }
    },
    mutations: {
      // each mutation has its own state as well
      updateUser: {
        loading: false,
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
          loading: false,
          error: undefined,
          result: {id: 2, bank: {id: "2", name: "Bank 2"}, name: "User 2"},
          params: 2
        },
        "3": {loading: true, params: 3}
      },
      getUsers: {
        // example of paginated state under custom cache key
        "all-pages": {
          loading: false,
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
        loading: false,
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
   - [Extended cache policy](https://github.com/gentlee/react-redux-cache#extended-cache-policy)
   - [Infinite scroll pagination](https://github.com/gentlee/react-redux-cache#infinite-scroll-pagination)
   - [redux-persist](https://github.com/gentlee/react-redux-cache#redux-persist)
 - [FAQ](https://github.com/gentlee/react-redux-cache#faq)
   - [What is a query cache key?](https://github.com/gentlee/react-redux-cache#what-is-a-query-cache-key)
   - [How race conditions are handled?](https://github.com/gentlee/react-redux-cache#how-race-conditions-are-handled)

### Installation
`react`, `redux` and `react-redux` are peer dependencies.

`fast-deep-equal` is an optional peer dependency if `deepComparisonEnabled` cache option is enabled (default is true).
```sh
npm add react-redux-cache react redux react-redux fast-deep-equal
```
### Initialization
The only function that needs to be imported is `createCache`, which creates fully typed reducer, hooks, actions, selectors and utils to be used in the app. You can create as many caches as needed, but keep in mind that normalization is not shared between them.
All typenames, queries and mutations should be passed while initializing the cache for proper typing.
#### cache.ts
```typescript
// Mapping of all typenames to their entity types, which is needed for proper normalization typing.
// Not needed if normalization is not used.
export type CacheTypenames = {
  users: User, // here `users` entities will have type `User`
  banks: Bank,
}

export const {
  cache,
  reducer,
  hooks: {useClient, useMutation, useQuery},
  // First call of createCache is only needed to provide proper Typenames - limitation of Typescript.
  // Second call receives cache options.
} = createCache<CacheTypenames>()({
  // Used as prefix for actions and in default cacheStateSelector for selecting cache state from redux state.
  name: 'cache',
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

For normalization two things are required:
- Set proper typenames while creating the cache - mapping of all entities and their corresponding TS types.
- Return an object from queries and mutations, that contains the following fields (besides `result`):

```typescript
type EntityChanges<T extends Typenames> = {  
  /** Entities that will be merged with existing. */
  merge?: PartialEntitiesMap<T>
  /** Entities that will replace existing. */
  replace?: Partial<EntitiesMap<T>>
  /** Ids of entities that will be removed. */
  remove?: EntityIds<T>
  /** Alias for `merge` to support normalizr. */
  entities?: EntityChanges<T>['merge']
}
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

export const getUser = async (id) => {
  // Result can be get by any way - fetch, axios etc, even with database connection.
  // There is no limitation here.
  const response = await ...

  // In this example normalizr package is used, but it is not necessary.
  return normalize(response, getUserSchema)
  // satisfies keyword is used here for proper typing of params and returned value.
} satisfies Query<number, CacheTypenames>

// Example of query without normalization (not recommended), with selecting access token from the store

export const getBank = (id, {getState}) => {
  const token = tokenSelector(getState())
  const result: Bank = ...
  return {result} // result is bank object, no entities passed
} satisfies Query<string>

// Example of mutation with normalization

export const removeUser = async (id, _, abortSignal) => {
  await ...
  return {
    remove: { users: [id] },
  }
} satisfies Query<number, CacheTypenames>
```

### Usage

Please check `example/` folder (`npm run example` to run).

#### UserScreen.tsx
```typescript
export const UserScreen = () => {
  const {id} = useParams()

  // useQuery connects to redux state and if user with that id is already cached, fetch won't happen (with default cachePolicy 'cache-first').
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

#### Extended cache policy

`cache-first` cache policy skips fetching if result is already cached, but sometimes it can't determine that we already have result in some other's query result or in normalized entities cache. In that case we can use `skip` parameter of a query:

```typescript
export const UserScreen = () => {
  ...

  const user = useSelectEntityById(userId, 'users')

  const [{loading, error}] = useQuery({
    query: 'getUser',
    params: userId,
    skip: !!user // skip fetching if we already have user cached by some other query, e.g. getUsers
  })

  ...
}
```

We can additionally check that entity is full or "fresh" enough:

```typescript
skip: !!user && isFullUser(user)
```

Another approach is to set `skip: true` and manually run `fetch` when needed:

```typescript
export const UserScreen = () => {
  const screenIsVisible = useScreenIsVisible()

  const [{result, loading, error}, fetchUser] = useQuery({
    query: 'getUser',
    params: userId,
    skip: true
  })

  useEffect(() => {
    if (screenIsVisible) {
      fetchUser()
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

As example, can be overriden when implementing pagination.

#### How race conditions are handled?

**Queries:** Queries are throttled: query with the same cache key (generated from params by default) is cancelled if already running.

**Mutations:** Mutations are debounced: previous similar mutation is aborted if it was running when the new one started. Third argument in mutations is `AbortSignal`, which can be used e.g. for cancelling http requests.
