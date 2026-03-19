import {applyMiddleware, combineReducers, createStore, Middleware} from 'redux'

import {createReducer} from '../../createReducer'
import {Typenames} from '../../types'
import {logEvent} from '../api/utils'
import {testCache} from './cache'

export const createReduxStore = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  {
    config: {name},
    reducer,
  }: {config: {name: N}; reducer: ReturnType<typeof createReducer<N, T, QP, QR, MP, MR>>},
  eventLogEnabled = false,
  consoleLoggerEnabled = false,
) => {
  const middlewares: Middleware[] = []
  if (consoleLoggerEnabled) {
    middlewares.push(require('redux-logger').default)
  }
  if (eventLogEnabled) {
    middlewares.push(() => (next) => (action) => {
      logEvent(action.type)
      return next(action)
    })
  }
  const store = createStore(combineReducers({[name]: reducer} as const), applyMiddleware(...middlewares))
  return store
}

export const EMPTY_STATE = Object.freeze(createReduxStore(testCache).getState().cache)
