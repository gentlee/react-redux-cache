import {useDispatch, useStore} from 'react-redux'
import {applyMiddleware, combineReducers, createStore} from 'redux'
import reduxLogger from 'redux-logger'
import {persistReducer, persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import {mutableNormalized} from './mutable-normalized/cache'
import {normalized} from './normalized/cache'
import {notNormalized} from './not-normalized/cache'
import {notNormalizedOptimized} from './not-normalized-optimized/cache'

export const createReduxStore = (persistEnabled: boolean, loggerEnabled: boolean) => {
  const addPersistenceIfNeeded = <T>(key: string, reducer: T) => {
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
      reducer,
    ) as T
  }

  const store = createStore(
    combineReducers({
      [normalized.config.cacheStateKey]: addPersistenceIfNeeded(normalized.config.name, normalized.reducer),
      [notNormalized.config.cacheStateKey]: addPersistenceIfNeeded(
        notNormalized.config.name,
        notNormalized.reducer,
      ),
      [notNormalizedOptimized.config.cacheStateKey]: addPersistenceIfNeeded(
        notNormalizedOptimized.config.name,
        notNormalizedOptimized.reducer,
      ),
      [mutableNormalized.config.cacheStateKey]: addPersistenceIfNeeded(
        mutableNormalized.config.name,
        mutableNormalized.reducer,
      ),
    }),
    loggerEnabled ? applyMiddleware(reduxLogger) : undefined,
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
