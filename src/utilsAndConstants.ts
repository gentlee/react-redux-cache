import {useMemo, useRef} from 'react'
import {useReducer} from 'react'

import {CacheOptions, EntitiesMap, EntityChanges, Typenames} from './types'

export const PACKAGE_SHORT_NAME = 'RRC'

export const isDev: boolean = (() => {
  try {
    // @ts-expect-error __DEV__ is only for React Native
    return __DEV__
  } catch (e) {
    return process.env.NODE_ENV === 'development'
  }
})()

export const defaultCacheOptions = {
  logsEnabled: false,
  validateFunctionArguments: true,
  validateHookArguments: true,
}

export const defaultQueryMutationState = {loading: false} as const

export const defaultGetParamsKey = <P = unknown>(params: P): string => {
  switch (typeof params) {
    case 'string':
      return params
    case 'object':
      return JSON.stringify(params)
    default:
      return String(params)
  }
}

const forceUpdateReducer = (i: number) => i + 1

/**
 * @returns function to force update a function component.
 */
export const useForceUpdate = () => {
  return useReducer(forceUpdateReducer, 0)[1]
}

export const useAssertValueNotChanged = (name: string, value: unknown) => {
  const firstMountRef = useRef(false)
  useMemo(() => {
    if (firstMountRef.current) {
      throw new Error(`${name} should not be modified`)
    }
    firstMountRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
}

export const log = (tag: string, data: unknown) => {
  console.debug(`@${PACKAGE_SHORT_NAME} [${tag}]`, data)
}

/**
 * Process changes to entities map.
 * @return `undefined` if nothing to change, otherwise processed entities map.
 */
export const processEntityChanges = <T extends Typenames>(
  entities: EntitiesMap<T>,
  changes: EntityChanges<T>,
  options: CacheOptions
): EntitiesMap<T> | undefined => {
  if (options.validateFunctionArguments) {
    // check for merge and entities both set
    if (changes.merge && changes.entities) {
      throw new Error('Merge and entities should not be both set')
    }
  }

  const {merge = changes.entities, replace, remove} = changes

  if (!merge && !replace && !remove) {
    return undefined
  }

  let result: EntitiesMap<T> | undefined

  for (const typename in entities) {
    const entitiesToMerge = merge?.[typename]
    const entitiesToReplace = replace?.[typename]
    const entitiesToRemove = remove?.[typename]

    if (!entitiesToMerge && !entitiesToReplace && !entitiesToRemove?.length) {
      continue
    }

    // check for key intersection
    if (options.validateFunctionArguments) {
      const mergeIds = entitiesToMerge && Object.keys(entitiesToMerge)
      const replaceIds = entitiesToReplace && Object.keys(entitiesToReplace)

      const idsSet = new Set<string>(mergeIds)
      replaceIds?.forEach((id) => idsSet.add(id))
      entitiesToRemove?.forEach((id) => idsSet.add(String(id))) // String() because Object.keys always returns strings

      const totalKeysInResponse =
        (mergeIds?.length ?? 0) + (replaceIds?.length ?? 0) + (entitiesToRemove?.length ?? 0)
      if (totalKeysInResponse !== 0 && idsSet.size !== totalKeysInResponse) {
        throw new Error('Merge, replace and remove changes have intersections for: ' + typename)
      }
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

  log('processEntityChanges', {
    entities,
    changes,
    result,
  })

  return result
}
