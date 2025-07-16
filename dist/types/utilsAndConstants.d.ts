import type {
  CacheOptions,
  EntitiesMap,
  EntityChanges,
  Key,
  QueryState,
  QueryStateComparer,
  Typenames,
} from './types'

export declare const PACKAGE_SHORT_NAME = 'rrc'
export declare const optionalUtils: {
  deepEqual?: (a: any, b: any) => boolean
}
export declare const IS_DEV: boolean
export declare const EMPTY_OBJECT: Readonly<{}>
export declare const EMPTY_ARRAY: readonly never[]
export declare const NOOP: () => void
export declare const defaultGetCacheKey: <P = unknown>(params: P) => Key
export declare const log: (tag: string, data?: unknown) => void
export declare const FetchPolicy: {
  /** Only if cache does not exist (result is undefined) or expired. */
  NoCacheOrExpired: <T extends Typenames = Typenames, P = unknown, R = unknown>(
    expired: boolean,
    _params: P,
    state: QueryState<T, P, R>
  ) => boolean
  /** Every fetch trigger. */
  Always: () => boolean
}
export declare const applyEntityChanges: <T extends Typenames>(
  entities: EntitiesMap<T>,
  changes: EntityChanges<T>,
  options: CacheOptions
) => EntitiesMap<T> | undefined
export declare const isEmptyObject: (o: object) => boolean
export declare const createStateComparer: <T extends Typenames = Typenames, Q = unknown, P = unknown>(
  fields: (keyof QueryState<T, Q, P>)[]
) => QueryStateComparer<T, Q, P>
