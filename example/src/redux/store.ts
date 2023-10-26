import {applyMiddleware, createStore} from 'redux'
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import {reducer} from './cache'

export const PERSIST_ENABLED = false

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage,
  },
  reducer
)

export const store = createStore(
  PERSIST_ENABLED ? (persistedReducer as typeof reducer) : reducer,
  process.env.NODE_ENV !== 'production'
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      applyMiddleware(require('redux-logger').default)
    : undefined
)

export const persistor = PERSIST_ENABLED ? persistStore(store) : undefined

export type ReduxState = ReturnType<typeof reducer>
