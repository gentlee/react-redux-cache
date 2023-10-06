import {createStore, applyMiddleware} from 'redux'
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import {reducer} from './cache'

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage,
  },
  reducer
)

export const store = createStore(
  persistedReducer,
  process.env.NODE_ENV !== 'production'
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      applyMiddleware(require('redux-logger').default)
    : undefined
)

export const persistor = persistStore(store)

export type ReduxState = ReturnType<typeof persistedReducer>
