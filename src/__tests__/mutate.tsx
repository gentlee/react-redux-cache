import {act, render as renderImpl} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {
  assertEventLog,
  emptyState,
  generateTestBank,
  generateTestEntitiesMap,
  generateTestUser,
  logEvent,
} from '../../testing/api/utils'
import {advanceApiTimeout, advanceHalfApiTimeout} from '../../testing/common'
import {useClient} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'
import {defaultQueryMutationState} from '../utilsAndConstants'

let store: ReturnType<typeof createReduxStore>
let mutate: ReturnType<typeof useClient>['mutate']

beforeEach(() => {
  store = createReduxStore(true)
})

test('should update mutation state and return result', async () => {
  store.dispatch({
    type: '@RRC/MERGE_ENTITY_CHANGES',
    changes: {merge: generateTestEntitiesMap(1)},
  })
  await act(() => render())

  let result
  await act(() => {
    mutate({
      mutation: 'updateUser',
      params: {id: 0, name: 'New name'},
    }).then((x) => (result = x))
  })
  await act(() => advanceApiTimeout())

  expect(result).toEqual({result: 0})
  expect(store.getState()).toEqual({
    ...emptyState,
    mutations: {
      updateUser: {
        ...defaultQueryMutationState,
        result: 0,
      },
    },
    entities: {
      banks: {0: generateTestBank('0')},
      users: {0: {...generateTestUser(0), name: 'New name'}},
    },
  })
  assertEventLog([
    '@RRC/MERGE_ENTITY_CHANGES',
    'render',
    '@RRC/SET_MUTATION_STATE_AND_ENTITIES',
    '@RRC/SET_MUTATION_STATE_AND_ENTITIES',
  ])
})

test('mutate should cancel previous not finished mutation', async () => {
  store.dispatch({
    type: '@RRC/MERGE_ENTITY_CHANGES',
    changes: {merge: generateTestEntitiesMap(2)},
  })
  await act(() => render())

  let result1
  await act(() => {
    mutate({
      mutation: 'updateUser',
      params: {id: 0, name: 'New name'},
    }).then((x) => (result1 = x))
  })
  await act(() => advanceHalfApiTimeout())

  let result2
  await act(() => {
    mutate({
      mutation: 'updateUser',
      params: {id: 1, name: 'New name 2'},
    }).then((x) => (result2 = x))
  })
  await act(() => advanceApiTimeout())

  expect(result1).toEqual({aborted: true})
  expect(result2).toEqual({result: 1})
  expect(store.getState()).toEqual({
    ...emptyState,
    mutations: {
      updateUser: {
        ...defaultQueryMutationState,
        result: 1,
      },
    },
    entities: {
      ...generateTestEntitiesMap(2),
      users: {
        0: generateTestUser(0),
        1: {...generateTestUser(1), name: 'New name 2'},
      },
    },
  })
  assertEventLog([
    '@RRC/MERGE_ENTITY_CHANGES',
    'render',
    '@RRC/SET_MUTATION_STATE_AND_ENTITIES',
    '@RRC/SET_MUTATION_STATE_AND_ENTITIES',
  ])
})

const MutateComponent = () => {
  mutate = useClient().mutate
  logEvent('render')
  return null
}

const render = () => {
  return renderImpl(
    <Provider store={store}>
      <MutateComponent />
    </Provider>
  )
}
