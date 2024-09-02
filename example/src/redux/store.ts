import {applyMiddleware, combineReducers, createStore} from 'redux'
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import {reducer} from './cache'

export const createReduxStore = (persistEnabled: boolean, loggerEnabled: boolean) => {
  function stringifyReplacer(key: string, value: unknown) {
    return key === 'loading' || key === 'error' ? undefined : value
  }

  const rootReducer = persistEnabled
    ? (persistReducer(
        {
          key: 'cache',
          storage,
          whitelist: ['entities', 'queries'],
          throttle: 1000,
          // @ts-expect-error wrong type
          serialize: (value: unknown) => JSON.stringify(value, stringifyReplacer),
        },
        reducer
      ) as typeof reducer)
    : reducer

  const store = createStore(
    combineReducers({cache: rootReducer}),
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
