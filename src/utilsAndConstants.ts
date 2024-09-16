import type {CacheOptions, EntitiesMap, EntityChanges, Key, Typenames} from './types'

export const PACKAGE_SHORT_NAME = 'rrc'

export const optionalUtils: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deepEqual?: (a: any, b: any) => boolean
} = {
  deepEqual: undefined,
}
try {
  optionalUtils.deepEqual = require('fast-deep-equal/es6')
} catch {
  console.debug(PACKAGE_SHORT_NAME + ': fast-deep-equal optional dependency was not installed')
}

export const IS_DEV: boolean = (() => {
  try {
    // @ts-expect-error __DEV__ is only for React Native
    return __DEV__
  } catch (e) {
    return process.env.NODE_ENV === 'development'
  }
})()

export const DEFAULT_QUERY_MUTATION_STATE = {loading: false} as const

export const defaultGetCacheKey = <P = unknown>(params: P): Key => {
  switch (typeof params) {
    case 'string':
    case 'symbol':
      return params
    case 'object':
      return JSON.stringify(params)
    default:
      return String(params)
  }
}

export const log = (tag: string, data?: unknown) => {
  console.debug(`@${PACKAGE_SHORT_NAME} [${tag}]`, data)
}

export const applyEntityChanges = <T extends Typenames>(
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

  const deepEqual = options.deepComparisonEnabled ? optionalUtils.deepEqual : undefined

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

    const oldEntities = entities[typename]
    let newEntities: EntitiesMap<T>[typeof typename] | undefined

    // remove
    entitiesToRemove?.forEach((id) => {
      if (oldEntities[id]) {
        newEntities ??= {...oldEntities}
        delete newEntities![id]
      }
    })

    // replace
    if (entitiesToReplace) {
      for (const id in entitiesToReplace) {
        const newEntity = entitiesToReplace[id]
        if (!deepEqual?.(oldEntities[id], newEntity)) {
          newEntities ??= {...oldEntities}
          newEntities[id] = newEntity
        }
      }
    }

    // merge
    if (entitiesToMerge) {
      for (const id in entitiesToMerge) {
        const oldEntity = oldEntities[id]
        const newEntity = {...oldEntity, ...entitiesToMerge[id]}
        if (!deepEqual?.(oldEntity, newEntity)) {
          newEntities ??= {...oldEntities}
          newEntities[id] = newEntity
        }
      }
    }

    if (!newEntities) {
      continue
    }

    result ??= {...entities}
    result[typename] = newEntities
  }

  options.logsEnabled &&
    log('applyEntityChanges', {
      entities,
      changes,
      options,
      result,
    })

  return result
}
