import {updateMutationStateAndEntities} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'
import {noop} from '../../utilsAndConstants'

test('should not change deeply equal params and result', () => {
  const store = createReduxStore(false)

  const initialParams = {id: 1, name: '2'}
  const initialResult = {id: 1, name: '2'}

  store.dispatch(
    updateMutationStateAndEntities('updateUserNotNormalized', {
      params: initialParams,
      result: initialResult,
      loading: new Promise(noop),
    })
  )

  store.dispatch(
    updateMutationStateAndEntities('updateUserNotNormalized', {
      params: {id: 1, name: '2'},
      result: {id: 1, name: '2'},
      loading: undefined,
    })
  )

  expect(store.getState().cache.mutations.updateUserNotNormalized.params).toBe(initialParams)
  expect(store.getState().cache.mutations.updateUserNotNormalized.result).toBe(initialResult)
})
