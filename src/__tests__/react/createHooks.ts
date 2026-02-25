import {createHooks} from '../../react/createHooks'
import {testCache} from '../../testing/redux/cache'

test('createHooks returns correct result', () => {
  const hooks = createHooks(testCache)

  expect(hooks).toStrictEqual({
    useClient: expect.any(Function),
    useEntitiesByTypename: expect.any(Function),
    useMutation: expect.any(Function),
    useQuery: expect.any(Function),
    useSelectEntityById: expect.any(Function),
  } satisfies typeof hooks)
})
