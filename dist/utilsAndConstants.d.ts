import type { CacheOptions, EntitiesMap, EntityChanges, Key, QueryState, Typenames } from './types';
export declare const PACKAGE_SHORT_NAME = "rrc";
export declare const optionalUtils: {
    deepEqual?: (a: any, b: any) => boolean;
};
export declare const IS_DEV: boolean;
export declare const EMPTY_OBJECT: Readonly<{}>;
export declare const EMPTY_ARRAY: readonly never[];
export declare const defaultGetCacheKey: <P = unknown>(params: P) => Key;
export declare const log: (tag: string, data?: unknown) => void;
export declare const FetchPolicy: {
    /** Only if cache does not exist (result is undefined) or expired. */
    NoCacheOrExpired: (expired: boolean, _: unknown, state: QueryState<unknown, unknown>) => boolean;
    /** Every fetch trigger. */
    Always: () => boolean;
};
export declare const applyEntityChanges: <T extends Typenames>(entities: EntitiesMap<T>, changes: EntityChanges<T>, options: CacheOptions) => EntitiesMap<T> | undefined;
export declare const isEmptyObject: (o: object) => boolean;
