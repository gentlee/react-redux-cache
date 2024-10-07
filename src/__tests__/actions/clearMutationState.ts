import {clearMutationState, updateMutationStateAndEntities} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'

test('should clear mutation state', () => {
  const store = createReduxStore(false)

  store.dispatch(
    updateMutationStateAndEntities('updateUser', {
      result: 0,
    })
  )
  store.dispatch(
    updateMutationStateAndEntities('removeUser', {
      result: undefined,
    })
  )
  expect(store.getState().cache.mutations).toStrictEqual({
    updateUser: {result: 0},
  })

  store.dispatch(clearMutationState(['updateUser']))
  expect(store.getState().cache.mutations.updateUser).toBe(undefined)

  store.dispatch(clearMutationState(['removeUser', 'removeUser', 'updateUser']))
  expect(store.getState().cache.mutations).toStrictEqual({})
})
