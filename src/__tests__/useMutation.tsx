import {act, render as renderImpl} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {assertEventLog, generateTestEntitiesMap, generateTestUser, logEvent} from '../testing/api/utils'
import {EMPTY_STATE} from '../testing/constants'
import {
  actions,
  cache,
  selectMutationError,
  selectMutationLoading,
  selectMutationParams,
  selectMutationResult,
  selectMutationState,
  selectors,
  useMutation,
} from '../testing/redux/cache'
import {createReduxStore} from '../testing/redux/store'
import {advanceApiTimeout, advanceHalfApiTimeout} from '../testing/utils'

let store: ReturnType<typeof createReduxStore>
let updateUser: ReturnType<typeof useMutation<'updateUser'>>[0]
let mutationWithError: ReturnType<typeof useMutation<'mutationWithError'>>[0]
let abort: () => void

beforeEach(() => {
  store = createReduxStore(true)
})

test('should be able to abort started mutation, mutation selectors work', async () => {
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
  await act(advanceApiTimeout)
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
  expect(mutationResult1).toStrictEqual({result: 0})
  expect(mutationResult2).toStrictEqual({aborted: true})
  expect(store.getState()).toStrictEqual({
    cache: {
      ...EMPTY_STATE,
      mutations: {
        updateUser: {
          params: {id: 0, name: 'New name 2'},
        },
      },
      entities: {
        ...generateTestEntitiesMap(1),
        users: {0: {...generateTestUser(0), name: 'New name'}},
      },
    },
  })
  expect(selectMutationState(store.getState(), 'updateUser')).toStrictEqual({
    params: {id: 0, name: 'New name 2'},
  })
  expect(selectMutationResult(store.getState(), 'updateUser')).toStrictEqual(undefined)
  expect(selectMutationLoading(store.getState(), 'updateUser')).toStrictEqual(false)
  expect(selectMutationError(store.getState(), 'updateUser')).toStrictEqual(undefined)
  expect(selectMutationParams(store.getState(), 'updateUser')).toStrictEqual({id: 0, name: 'New name 2'})
  assertEventLog([
    '@rrc/cache/mergeEntityChanges',
    'render: loading: undefined, result: undefined',
    '@rrc/cache/updateMutationStateAndEntities', // loading true
    'render: loading: [object Promise], result: undefined',
    '@rrc/cache/updateMutationStateAndEntities', // loading false, result 0
    'render: loading: undefined, result: 0',
    '@rrc/cache/updateMutationStateAndEntities', // loading true, result undefined
    'render: loading: [object Promise], result: undefined',
    '@rrc/cache/updateMutationStateAndEntities', // abort, loading false
    'render: loading: undefined, result: undefined',
  ])
})

test('handles errors', async () => {
  await act(() => render())

  await act(() => {
    mutationWithError(undefined)
  })
  await act(advanceApiTimeout)

  expect(selectMutationError(store.getState(), 'mutationWithError')).toHaveProperty('message', 'Test error')
  expect(cache.globals.onError).toBeCalledWith(
    new Error('Test error'),
    'mutationWithError',
    undefined,
    store,
    actions,
    selectors
  )
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
  ;[mutationWithError] = useMutation({mutation: 'mutationWithError'})
  logEvent(`render: loading: ${state.loading}, result: ${state.result}`)
  return null
}
