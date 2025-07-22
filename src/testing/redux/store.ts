import {applyMiddleware, combineReducers, createStore, Middleware} from 'redux'

import {logEvent} from '../api/utils'
import {cache, reducer} from './cache'

export const createReduxStore = (
  eventLogEnabled: boolean,
  consoleLoggerEnabled = false //cache.options.logsEnabled
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

  return createStore(combineReducers({[cache.name]: reducer}), applyMiddleware(...middlewares))
}
