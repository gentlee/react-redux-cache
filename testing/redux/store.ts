import {applyMiddleware, createStore} from 'redux'
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import {reducer} from './cache'

export const createReduxStore = (persistEnabled: boolean, loggerEnabled: boolean) => {
  const rootReducer = persistEnabled
    ? reducer
    : (persistReducer(
        {
          key: 'root',
          storage,
        },
        reducer
      ) as typeof reducer)

  const store = createStore(
    rootReducer,
    loggerEnabled
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        applyMiddleware(require('redux-logger').default)
      : undefined
  )

  const persistor = persistEnabled ? persistStore(store) : undefined

  return {
    store,
    persistor,
  }
}

export type ReduxState = ReturnType<typeof reducer>
