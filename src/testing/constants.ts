import {generateTestEntitiesMap} from './api/utils'
import {createReduxStore} from './redux/store'

export const EMPTY_STATE = createReduxStore(false).getState().cache

export const GET_USERS_ONE_PAGE_STATE = {
  entities: generateTestEntitiesMap(3),
  queries: {
    ...EMPTY_STATE.queries,
    getUsers: {
      'all-pages': {
        result: {
          items: [0, 1, 2],
          page: 1,
        },
        params: {page: 1},
        loading: false,
      },
    },
  },
  mutations: {},
}
