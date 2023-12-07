import {applyMiddleware, createStore, Middleware} from 'redux'

import {logEvent} from '../api/utils'
import {cache, reducer} from './cache'

export const createReduxStore = (
  eventLogEnabled: boolean,
  consoleLoggerEnabled = cache.options.logsEnabled
) => {
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

  return createStore(reducer, applyMiddleware(...middlewares))
}

export type ReduxState = ReturnType<typeof reducer>
