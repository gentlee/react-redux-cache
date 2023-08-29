import {createCache} from '../redux-cache'
import {mutations, queries} from '../redux/reducer'
import {store} from '../redux/store'

export const cache = createCache({
  // @ts-ignore
  store,
  // @ts-ignore
  queries,
  mutations,
})
