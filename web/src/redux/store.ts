import { createStore, applyMiddleware } from 'redux'
import { cache } from "../cache/cache"
import { createCacheReducer } from "../redux-cache"
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const reducer = createCacheReducer(['users', 'banks'], cache.queries, cache.mutations)

const persistedReducer = persistReducer({
  key: 'root',
  storage
}, reducer)

export const store = createStore(
  persistedReducer,
  process.env.NODE_ENV !== 'production' ? applyMiddleware(require('redux-logger').default) : undefined
)

export const persistor = persistStore(store)

export type ReduxState = ReturnType<typeof reducer>
