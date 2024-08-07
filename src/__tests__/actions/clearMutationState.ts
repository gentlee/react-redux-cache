import {clearMutationState, updateMutationStateAndEntities} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'
import {DEFAULT_QUERY_MUTATION_STATE} from '../../utilsAndConstants'

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
  expect(store.getState().mutations).toStrictEqual({
    updateUser: {
      ...DEFAULT_QUERY_MUTATION_STATE,
      result: 0,
    },
    removeUser: {
      ...DEFAULT_QUERY_MUTATION_STATE,
      result: undefined,
    },
  })

  store.dispatch(clearMutationState(['updateUser']))
  expect(store.getState().mutations.updateUser).toBe(undefined)

  store.dispatch(clearMutationState(['removeUser', 'removeUser', 'updateUser']))
  expect(store.getState().mutations).toStrictEqual({})
})
