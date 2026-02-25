import {testCaches} from '../../testing/redux/cache'
import {initializeForZustand} from '../../zustand'

describe.each(testCaches)('%s', (_, cache) => {
  test('getInitialState', () => {
    const {
      utils: {getInitialState},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = initializeForZustand(cache, {getState: null} as any)

    expect(getInitialState()).toStrictEqual({
      cache: {
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
      },
    })
  })
})
