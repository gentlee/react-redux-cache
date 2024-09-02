import {act, render as renderImpl} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {
  assertEventLog,
  generateTestEntitiesMap,
  generateTestUser,
  logEvent,
} from '../testing/api/utils'
import {EMPTY_STATE} from '../testing/constants'
import {useMutation} from '../testing/redux/cache'
import {createReduxStore} from '../testing/redux/store'
import {advanceApiTimeout, advanceHalfApiTimeout} from '../testing/utils'
import {DEFAULT_QUERY_MUTATION_STATE} from '../utilsAndConstants'

let store: ReturnType<typeof createReduxStore>
let updateUser: ReturnType<typeof useMutation<'updateUser'>>[0]
let abort: () => void

beforeEach(() => {
  store = createReduxStore(true)
})

test('should be able to abort started mutation', async () => {
  store.dispatch({
    type: '@rrc/cache/mergeEntityChanges',
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
    cache: {
      ...EMPTY_STATE,
      mutations: {updateUser: DEFAULT_QUERY_MUTATION_STATE},
      entities: {
        ...generateTestEntitiesMap(1),
        users: {0: {...generateTestUser(0), name: 'New name'}},
      },
    },
  })
  assertEventLog([
    '@rrc/cache/mergeEntityChanges',
    'render: loading: false, result: undefined',
    '@rrc/cache/updateMutationStateAndEntities', // loading true
    'render: loading: true, result: undefined',
    '@rrc/cache/updateMutationStateAndEntities', // loading false, result 0
    'render: loading: false, result: 0',
    '@rrc/cache/updateMutationStateAndEntities', // loading true, result undefined
    'render: loading: true, result: undefined',
    '@rrc/cache/updateMutationStateAndEntities', // abort, loading false
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
