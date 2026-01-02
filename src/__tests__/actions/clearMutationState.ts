import {testCaches} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'

describe.each(testCaches)('%s', (_, cache, withChangeKey) => {
  test('should clear mutation state', () => {
    const {
      actions: {updateMutationStateAndEntities, clearMutationState},
    } = cache

    const store = createReduxStore(cache)
    store.dispatch(updateMutationStateAndEntities('updateUser', {result: 0}))
    store.dispatch(updateMutationStateAndEntities('removeUser', {result: undefined}))

    expect(store.getState().cache.mutations).toStrictEqual(withChangeKey(0, {updateUser: {result: 0}}))

    store.dispatch(clearMutationState(['updateUser']))
    expect(store.getState().cache.mutations.updateUser).toBe(undefined)

    store.dispatch(clearMutationState(['removeUser', 'removeUser', 'updateUser']))
    expect(store.getState().cache.mutations).toStrictEqual(withChangeKey(1, {}))
  })
})
