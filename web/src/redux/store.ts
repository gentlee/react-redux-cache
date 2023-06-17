import { createStore, applyMiddleware } from 'redux'
import { cache } from "../cache/cache"
import { createCacheReducer } from "../redux-cache"

const reducer = createCacheReducer(['users', 'banks'], cache.queries) // TODO endpoints?

export const store = createStore(
  reducer,
  process.env.NODE_ENV !== 'production' ? applyMiddleware(require('redux-logger').default) : undefined
)

export type ReduxState = ReturnType<typeof reducer>
