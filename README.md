# react-redux-cache

**Powerfull** and **customizable** data fetching and caching library that supports **normalization** (unlike `react-query` and `rtk-query`), built on top of `redux`.

**Normalization** is the only way to keep the state of the app **consistent** between different views, reduces the number of fetches and allows to show cached data when navigating, which greatly improves **user experience**.

Hooks, reducer, actions and selectors are fully typed and written on Typescript, so redux store will be properly typed and you will remain a **full control** of its state with ability to write custom selectors, actions and reducers to manage cached state.
    
Usage example can be found in `example/` folder and run by `npm run example` command from the root folder.
    
### Table of contents

 - [Installation](https://github.com/gentlee/react-redux-cache#Installation)
 - [Initialization](https://github.com/gentlee/react-redux-cache#Initialization)
   - [cache.ts](https://github.com/gentlee/react-redux-cache#cachets) 
   - [store.ts](https://github.com/gentlee/react-redux-cache#storets) 
   - [api.ts](https://github.com/gentlee/react-redux-cache#apits) 
 - [Usage](https://github.com/gentlee/react-redux-cache#usage)
 - [Advanced](https://github.com/gentlee/react-redux-cache#advanced)

### Installation
`react` and `redux` are peer dependencies.
```sh
npm add react-redux-cache react redux
```
### Initialization
Create reducer, hooks, actions and selectors with `createCache`.
All queries and mutations should be passed while initializing the cache, for proper typing and later access by key.
In this example we omit usage of actions and selectors.
#### cache.ts
```typescript
export const {
  reducer,
  hooks: {useMutation, useQuery, useSelectEntityById},
} = createCache({
  // This selector should select cache state from redux store state, based on the path to its reducer.
  cacheStateSelector: (state) => state.cache,
  // Typenames provide a mapping of all typenames to their entity types.
  // Empty objects with type casting can be used as values.
  typenames: {
    users: {} as User,
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
export const getUser = async (id: number) => {
  const result: User = await ...
  
  const normalizedResult: {
    result: number
    entities: {
      users: Record<number, User>
      banks: Record<string, Bank>
    }
  } = normalize(result, getUserSchema)

  return normalizedResult
}

export const removeUser = async (id: number) => {
  awwait ...
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

  // useQuery will infer all types from created cache,
  // telling you that params and result here are of type `number`.
  const [{result: userId, loading, error}] = useQuery({
    query: 'getUser',
    params: Number(id),
  })

  const [updateUser, {loading: updatingUser}] = useMutation({
    mutation: 'updateUser',
  })

  // This selector is created by createCache and also returns proper types - User and Bank
  const user = useSelectEntityById(userId, 'users')
  const bank = useSelectEntityById(user?.bank, 'banks')

  if (loading) {
    return ... // loading state
  }

  return ... // loaded state
}

### Advanced
To be done...
