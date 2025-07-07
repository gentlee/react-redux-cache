import type {CacheOptions, EntitiesMap, EntityChanges, Key, QueryState, Typenames} from './types'

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

export const EMPTY_OBJECT = Object.freeze({})

export const EMPTY_ARRAY = Object.freeze([])

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = () => {}

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

export const FetchPolicy = {
  /** Only if cache does not exist (result is undefined) or expired. */
  NoCacheOrExpired: <T extends Typenames = Typenames, P = unknown, R = unknown>(
    expired: boolean,
    _params: P,
    state: QueryState<T, P, R>
  ) => {
    return expired || state.result === undefined
  },
  /** Every fetch trigger. */
  Always: () => true,
}

export const applyEntityChanges = <T extends Typenames>(
  entities: EntitiesMap<T>,
  changes: EntityChanges<T>,
  options: CacheOptions
): EntitiesMap<T> | undefined => {
  if (changes.merge && changes.entities) {
    console.warn('react-redux-cache.applyEntityChanges: merge and entities should not be both set')
  }

  const {merge = changes.entities, replace, remove} = changes

  if (!merge && !replace && !remove) {
    return undefined
  }

  const deepEqual = options.deepComparisonEnabled ? optionalUtils.deepEqual : undefined

  let result: EntitiesMap<T> | undefined

  // TODO refactor to remove this Set
  const typenames = new Set([
    ...(changes.entities ? Object.keys(changes.entities) : EMPTY_ARRAY),
    ...(changes.merge ? Object.keys(changes.merge) : EMPTY_ARRAY),
    ...(changes.remove ? Object.keys(changes.remove) : EMPTY_ARRAY),
    ...(changes.replace ? Object.keys(changes.replace) : EMPTY_ARRAY),
  ])
  for (const typename of typenames) {
    const entitiesToMerge = merge?.[typename]
    const entitiesToReplace = replace?.[typename]
    const entitiesToRemove = remove?.[typename]

    if (!entitiesToMerge && !entitiesToReplace && !entitiesToRemove?.length) {
      continue
    }

    // check for key intersection
    if (options.additionalValidation) {
      const mergeIds = entitiesToMerge && Object.keys(entitiesToMerge)
      const replaceIds = entitiesToReplace && Object.keys(entitiesToReplace)

      const idsSet = new Set<string>(mergeIds)
      replaceIds?.forEach((id) => idsSet.add(id))
      entitiesToRemove?.forEach((id) => idsSet.add(String(id))) // String() because Object.keys always returns strings

      const totalKeysInResponse =
        (mergeIds?.length ?? 0) + (replaceIds?.length ?? 0) + (entitiesToRemove?.length ?? 0)
      if (totalKeysInResponse !== 0 && idsSet.size !== totalKeysInResponse) {
        console.warn(
          'react-redux-cache.applyEntityChanges: merge, replace and remove changes have intersections for: ' +
            typename
        )
      }
    }

    const oldEntities =
      entities[typename] ?? (EMPTY_OBJECT as NonNullable<(typeof entities)[typeof typename]>)
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
    // @ts-expect-error fix later
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

export const isEmptyObject = (o: object) => {
  for (const _ in o) {
    return false
  }
  return true
}
