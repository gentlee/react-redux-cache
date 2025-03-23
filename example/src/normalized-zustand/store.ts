import {create} from 'zustand'

import {cache, reducer} from './cache'

type State = {
  cache: ReturnType<typeof reducer>
}

type Actions = {
  dispatch: (action: CacheAction) => void
}

type CacheAction = Parameters<typeof reducer>[1]

const initialState: State = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: reducer(undefined, {} as any),
}

export const useStore = create<State & Actions>((set, get) => ({
  ...initialState,
  dispatch: (action: CacheAction) => {
    set({cache: reducer(get().cache, action)})
  },
}))

const store = {
  dispatch: useStore.getState().dispatch,
  getState: useStore.getState,
}

cache.storeHooks.useStore = () => store
cache.storeHooks.useSelector = useStore
