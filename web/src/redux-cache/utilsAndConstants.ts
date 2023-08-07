export const defaultEndpointState = { loading: false } as const

export const defaultGetParamsKey = (params: any) => !params ? '' : JSON.stringify(params)

export const defaultCacheStateSelector = (state: any) => state

export const shallowMerge = (a: any, b: any) => {
  const result = { ...a }
  for (const key in b) {
    result[key] = { ...a[key], ...b[key] }
  }
  return result
}
