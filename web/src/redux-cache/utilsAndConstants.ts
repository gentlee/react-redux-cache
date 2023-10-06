import {useMemo, useRef} from 'react'

import {useReducer} from 'react'

export const PACKAGE_NAME = 'redux-cache'

export const isDev: boolean = (() => {
  try {
    // @ts-ignore
    return __DEV__
  } catch (e) {
    return process.env.NODE_ENV === 'development'
  }
})()

export const defaultEndpointState = {loading: false} as const

export const defaultGetParamsKey = (params: any) => (!params ? '' : JSON.stringify(params))

export const defaultCacheStateSelector = (state: any) => state

const forceUpdateReducer = (i: number) => i + 1

/**
 * @returns function to force update a function component.
 */
export const useForceUpdate = () => {
  return useReducer(forceUpdateReducer, 0)[1]
}

export const shallowMerge = (a: any, b: any) => {
  const result = {...a}
  for (const key in b) {
    result[key] = {...a[key], ...b[key]}
  }
  return result
}

export const useAssertValueNotChanged = (name: string, value: any) => {
  const firstMountRef = useRef(false)
  useMemo(() => {
    if (firstMountRef.current) {
      throw new Error(`${name} should not be modified`)
    }
    firstMountRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
}
