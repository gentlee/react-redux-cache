import { createReducer } from 'redux-light'

export const createCacheReducer = (typenames: string[], queries: Record<string, any>, mutations: Record<string, any>) => {
  const initialState = {
    entities: Object.fromEntries(typenames.map(typename => [typename, {}])),
    queries: Object.fromEntries(Object.keys(queries).map(queryKey => [queryKey, {}])),
    mutations: Object.fromEntries(Object.keys(mutations).map(mutationKey => [mutationKey, {}])), 
  }
  console.log('[createCacheReducer]', {
    typenames,
    queries,
    mutations,
    initialState
  })
  return createReducer({ initialState })
}
