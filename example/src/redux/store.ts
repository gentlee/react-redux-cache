import {useDispatch, useStore} from 'react-redux'
import {applyMiddleware, combineReducers, createStore} from 'redux'
import reduxLogger from 'redux-logger'
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import {cache, reducer} from '../normalized/cache'
import {cacheNotNormalized} from '../not-normalized/cache'

export const createReduxStore = (persistEnabled: boolean, loggerEnabled: boolean) => {
  const addPersistence = <T>(key: string, reducer: T) => {
    if (!persistEnabled) {
      return reducer
    }

    const stringifyReplacer = (key: string, value: unknown) => {
      return key === 'loading' || key === 'error' ? undefined : value
    }

    return persistReducer(
      {
        key,
        storage,
        whitelist: ['entities', 'queries'],
        throttle: 1000,
        // @ts-expect-error wrong type
        serialize: (value: unknown) => JSON.stringify(value, stringifyReplacer),
      },
      reducer
    ) as T
  }

  const store = createStore(
    combineReducers({
      [cache.name]: addPersistence(cache.name, reducer),
      [cacheNotNormalized.cache.name]: addPersistence(
        cacheNotNormalized.cache.name,
        cacheNotNormalized.reducer
      ),
    }),
    loggerEnabled ? applyMiddleware(reduxLogger) : undefined
  )

  const persistor = persistEnabled ? persistStore(store) : undefined

  return {
    store,
    persistor,
  }
}

export type AppStore = ReturnType<typeof createReduxStore>['store']
export const useAppStore = useStore as () => AppStore
export const useAppDispatch = useDispatch as () => AppStore['dispatch']

export type ReduxState = ReturnType<typeof reducer>
