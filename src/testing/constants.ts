import {testCache} from './redux/cache'
import {createReduxStore} from './redux/store'

export const EMPTY_STATE = Object.freeze(createReduxStore(testCache).getState().cache)
