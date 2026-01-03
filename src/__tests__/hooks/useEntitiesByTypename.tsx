import {act, render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {assertEventLog, logEvent} from '../../testing/api/utils'
import {testCaches} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'

describe.each(testCaches)('%s', (_, cache, withChangeKey) => {
  const {
    actions: {mergeEntityChanges, updateQueryStateAndEntities, updateMutationStateAndEntities},
    hooks: {useEntitiesByTypename},
  } = cache

  test('useEntitiesByTypename', () => {
    const store = createReduxStore(cache)
    let result: ReturnType<typeof useEntitiesByTypename<'users'>>

    const TestComponent = () => {
      result = useEntitiesByTypename('users')

      logEvent('render')

      return null
    }

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    )

    act(() => store.dispatch(mergeEntityChanges({merge: {users: {0: {id: 0, name: 'new name'}}}})))
    act(() => store.dispatch(mergeEntityChanges({merge: {users: {1: {id: 1, name: 'new name 1'}}}})))
    act(() => store.dispatch(mergeEntityChanges({merge: {banks: {0: {id: '0', name: 'new bank'}}}})))
    act(() => store.dispatch(updateQueryStateAndEntities('getFullUser', 0, {params: 0, result: 0})))
    act(() => store.dispatch(updateQueryStateAndEntities('getUser', 0, {params: 0, result: 0})))
    act(() => store.dispatch(updateMutationStateAndEntities('removeUser', {error: new Error('test')})))

    assertEventLog(['render', 'render', 'render'])

    expect(result).toStrictEqual(
      withChangeKey(1, {
        0: {id: 0, name: 'new name'},
        1: {id: 1, name: 'new name 1'},
      })
    )
  })
})
