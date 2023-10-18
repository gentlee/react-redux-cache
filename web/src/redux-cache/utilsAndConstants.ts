import {useMemo, useRef} from 'react'

import {useReducer} from 'react'
import {CacheOptions, EntitiesMap, Response, Typenames} from './types'

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

export const mergeResponseToEntities = <T extends Typenames>(
  entities: EntitiesMap<T>,
  response: Response<T>,
  options: CacheOptions
) => {
  const {merge = response.entities, replace, remove} = response

  if (!merge && !replace && !remove) {
    return undefined
  }

  if (options.runtimeErrorChecksEnabled) {
    // check for merge and entities both set
    if (response.merge && response.entities) {
      throw new Error('Response merge and entities should not be both set')
    }

    // check for key intersection
    const mergeKeys = merge && Object.keys(merge)
    const replaceKeys = replace && Object.keys(replace)
    const removeKeys = remove && Object.keys(remove)

    const keysSet = new Set(mergeKeys)
    replaceKeys?.forEach((key) => keysSet.add(key))
    removeKeys?.forEach((key) => keysSet.add(key))

    const totalKeysInResponse =
      (mergeKeys?.length ?? 0) + (replaceKeys?.length ?? 0) + (removeKeys?.length ?? 0)
    if (keysSet.size !== totalKeysInResponse) {
      throw new Error('Merge, replace and remove keys should not intersect')
    }
  }

  let result: EntitiesMap<T> | undefined

  for (const typename in entities) {
    const entitiesToMerge = merge?.[typename]
    const entitiesToReplace = replace?.[typename]
    const entitiesToRemove = remove?.[typename]

    if (!entitiesToMerge && !entitiesToReplace && !entitiesToRemove) {
      continue
    }

    const newEntities = {...entities[typename]}

    // remove
    entitiesToRemove?.forEach((id) => delete newEntities[id])

    // replace
    if (entitiesToReplace) {
      for (const id in entitiesToReplace) {
        newEntities[id] = entitiesToReplace[id]
      }
    }

    // merge
    if (entitiesToMerge) {
      for (const id in entitiesToMerge) {
        newEntities[id] = {...newEntities[id], ...entitiesToMerge[id]}
      }
    }

    result ??= {...entities}
    result[typename] = newEntities
  }

  console.log('[mergeResponseToEntities]', {
    entities,
    response,
    result,
  })

  return result
}
