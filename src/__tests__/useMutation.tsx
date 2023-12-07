import {act, render as renderImpl} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {
  assertEventLog,
  emptyState,
  generateTestEntitiesMap,
  generateTestUser,
  logEvent,
} from '../testing/api/utils'
import {advanceApiTimeout, advanceHalfApiTimeout} from '../testing/common'
import {useMutation} from '../testing/redux/cache'
import {createReduxStore} from '../testing/redux/store'
import {defaultQueryMutationState} from '../utilsAndConstants'

let store: ReturnType<typeof createReduxStore>
let updateUser: ReturnType<typeof useMutation<'updateUser'>>[0]
let abort: () => void

beforeEach(() => {
  store = createReduxStore(true)
})

test('should be able to abort started mutation', async () => {
  store.dispatch({
    type: '@RRC/MERGE_ENTITY_CHANGES',
    changes: {merge: generateTestEntitiesMap(1)},
  })
  await act(() => render())

  // abort 1
  const abortResult1 = await act(() => abort())

  // abort 2
  let mutationResult1
  await act(() => {
    updateUser({id: 0, name: 'New name'}).then((x) => (mutationResult1 = x))
  })
  await act(() => advanceApiTimeout())
  const abortResult2 = await act(() => abort())

  // abort 3
  let mutationResult2
  await act(() => {
    updateUser({id: 0, name: 'New name 2'}).then((x) => (mutationResult2 = x))
  })
  await act(() => advanceHalfApiTimeout())
  const abortResult3 = await act(() => abort())
  await act(() => advanceHalfApiTimeout())

  expect(abortResult1).toBe(false)
  expect(abortResult2).toBe(false)
  expect(abortResult3).toBe(true)
  expect(mutationResult1).toBe(undefined) // useMutation's mutate doesn't return result
  expect(mutationResult2).toBe(undefined)
  expect(store.getState()).toEqual({
    ...emptyState,
    mutations: {updateUser: defaultQueryMutationState},
    entities: {
      ...generateTestEntitiesMap(1),
      users: {0: {...generateTestUser(0), name: 'New name'}},
    },
  })
  assertEventLog([
    '@RRC/MERGE_ENTITY_CHANGES',
    'render: loading: false, result: undefined',
    '@RRC/SET_MUTATION_STATE_AND_ENTITIES', // loading true
    'render: loading: true, result: undefined',
    '@RRC/SET_MUTATION_STATE_AND_ENTITIES', // loading false, result 0
    'render: loading: false, result: 0',
    '@RRC/SET_MUTATION_STATE_AND_ENTITIES', // loading true, result undefined
    'render: loading: true, result: undefined',
    '@RRC/SET_MUTATION_STATE_AND_ENTITIES', // abort, loading false
    'render: loading: false, result: undefined',
  ])
})

const render = () => {
  return renderImpl(
    <Provider store={store}>
      <UseMutationComponent />
    </Provider>
  )
}

const UseMutationComponent = () => {
  let state
  ;[updateUser, state, abort] = useMutation({mutation: 'updateUser'})
  logEvent(`render: loading: ${state.loading}, result: ${state.result}`)
  return null
}
