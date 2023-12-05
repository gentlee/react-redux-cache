import {applyMiddleware, createStore, Middleware} from 'redux'
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import {logEvent} from '../api/utils'
import {cache, reducer} from './cache'

export const createReduxStore = (
  persistEnabled: boolean,
  eventLogEnabled: boolean,
  consoleLoggerEnabled = cache.options.logsEnabled
) => {
  const rootReducer = persistEnabled
    ? reducer
    : (persistReducer(
        {
          key: 'root',
          storage,
        },
        reducer
      ) as typeof reducer)

  const middlewares: Middleware[] = []
  if (consoleLoggerEnabled) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    middlewares.push(require('redux-logger').default)
  }
  if (eventLogEnabled) {
    middlewares.push(() => (next) => (action) => {
      logEvent(action.type)
      return next(action)
    })
  }

  const store = createStore(rootReducer, applyMiddleware(...middlewares))

  const persistor = persistEnabled ? persistStore(store) : undefined

  return {
    store,
    persistor,
  }
}

export type ReduxState = ReturnType<typeof reducer>
