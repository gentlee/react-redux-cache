import {act, render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {assertEventLog, logEvent} from '../../testing/api/utils'
import {testCaches} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'

describe.each(testCaches)('%s', (_, cache) => {
  const {
    cache: {
      storeHooks,
      options: {mutableCollections},
    },
    actions: {mergeEntityChanges, updateQueryStateAndEntities, updateMutationStateAndEntities},
    selectors,
  } = cache

  test('subscription to collections', () => {
    const store = createReduxStore(cache)

    const TestComponent = () => {
      storeHooks.useSelector(selectors.selectEntities)
      storeHooks.useSelector((state) => selectors.selectEntitiesByTypename(state, 'users'))
      storeHooks.useSelector((state) => selectors.selectCacheState(state).queries)
      storeHooks.useSelector((state) => selectors.selectCacheState(state).queries.getUser)
      storeHooks.useSelector((state) => selectors.selectCacheState(state).mutations)

      logEvent('render')

      return null
    }

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
    )

    act(() => store.dispatch(mergeEntityChanges({merge: {users: {0: {id: 0, name: 'new name'}}}})))
    act(() => store.dispatch(mergeEntityChanges({merge: {users: {1: {id: 1, name: 'new name 1'}}}})))
    act(() => store.dispatch(mergeEntityChanges({merge: {banks: {0: {id: '0', name: 'new bank'}}}})))
    act(() => store.dispatch(updateQueryStateAndEntities('getFullUser', 0, {params: 0, result: 0})))
    act(() => store.dispatch(updateQueryStateAndEntities('getUser', 0, {params: 0, result: 0})))
    act(() => store.dispatch(updateMutationStateAndEntities('removeUser', {error: new Error('test')})))

    assertEventLog(
      mutableCollections
        ? [
            'render',
            'render', // entities.users: undefined -> {}
          ]
        : ['render', 'render', 'render', 'render', 'render', 'render', 'render'],
    )
  })
})
