import {create} from 'zustand'

import {cache, getInitialState, reducer} from './cache'

type State = {[cache.name]: ReturnType<typeof reducer>}
type Actions = {dispatch: (action: Parameters<typeof reducer>[1]) => void}

const initialState = {[cache.name]: getInitialState()}

export const useStore = create<State & Actions>((set, get) => ({
  ...initialState,
  dispatch: (action) => set({cache: reducer(get().cache, action)}),
}))

const store = {dispatch: useStore.getState().dispatch, getState: useStore.getState}
cache.storeHooks.useStore = () => store
cache.storeHooks.useSelector = useStore
