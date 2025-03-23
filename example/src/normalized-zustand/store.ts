import {create} from 'zustand'

import {cache, reducer} from './cache'

type State = {[cache.name]: ReturnType<typeof reducer>}
type Actions = {dispatch: (action: CacheAction) => void}
type CacheAction = Parameters<typeof reducer>[1]

export const useStore = create<State & Actions>((set, get) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [cache.name]: reducer(undefined, {} as any),
  dispatch: (action: CacheAction) => {
    set({cache: reducer(get().cache, action)})
  },
}))

const store = {dispatch: useStore.getState().dispatch, getState: useStore.getState}
cache.storeHooks.useStore = () => store
cache.storeHooks.useSelector = useStore
