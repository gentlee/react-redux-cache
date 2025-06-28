import {createTestingCache} from '../createCache'

test('getInitialState', () => {
  const {
    utils: {getInitialState},
  } = createTestingCache('cache')

  expect(getInitialState()).toStrictEqual({
    entities: {},
    queries: {
      getUser: {},
      getUsers: {},
    },
    mutations: {},
  })
})
