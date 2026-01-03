import {testCaches} from '../../testing/redux/cache'

describe.each(testCaches)('%s', (_, cache) => {
  test('getInitialState', () => {
    const {
      utils: {getInitialState},
    } = cache

    expect(getInitialState()).toStrictEqual({
      entities: {},
      queries: {
        getFullUser: {},
        getUser: {},
        getUserExpires: {},
        getUserTtl: {},
        getUserWithResultComparer: {},
        getUserCustomCacheKey: {},
        getUsers: {},
        queryWithError: {},
      },
      mutations: {},
    })
  })
})
