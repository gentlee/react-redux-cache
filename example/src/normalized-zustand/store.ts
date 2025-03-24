import {create} from 'zustand'

import {cache, reducer} from './cache'

type State = {[cache.name]: ReturnType<typeof reducer>}
type Actions = {dispatch: (action: CacheAction) => void}
type CacheAction = Parameters<typeof reducer>[1]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initialState: State = {cache: reducer(undefined, {} as any)}

export const useStore = create<State & Actions>((set, get) => ({
  ...initialState,
  dispatch: (action) => set({cache: reducer(get().cache, action)}),
}))

const store = {dispatch: useStore.getState().dispatch, getState: useStore.getState}
cache.storeHooks.useStore = () => store
cache.storeHooks.useSelector = useStore
