import {updateQueryStateAndEntities} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'
import {NOOP} from '../../utilsAndConstants'

test('should not change deeply equal params and result', () => {
  const store = createReduxStore(false)

  const initialParams = {page: 1}
  const initialResult = {items: [1, 2, 3], page: 1}

  store.dispatch(
    updateQueryStateAndEntities('getUsers', 0, {
      params: initialParams,
      result: initialResult,
      loading: new Promise(NOOP),
    })
  )

  store.dispatch(
    updateQueryStateAndEntities('getUsers', 0, {
      params: {page: 1},
      result: {items: [1, 2, 3], page: 1},
      loading: undefined,
    })
  )

  expect(store.getState().cache.queries.getUsers[0]?.params).toBe(initialParams)
  expect(store.getState().cache.queries.getUsers[0]?.result).toBe(initialResult)
})
