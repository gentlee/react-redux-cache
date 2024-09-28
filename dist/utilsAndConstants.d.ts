import type { CacheOptions, EntitiesMap, EntityChanges, Key, Typenames } from './types';
export declare const PACKAGE_SHORT_NAME = "rrc";
export declare const optionalUtils: {
    deepEqual?: (a: any, b: any) => boolean;
};
export declare const IS_DEV: boolean;
export declare const DEFAULT_QUERY_MUTATION_STATE: Readonly<{
    loading: false;
}>;
export declare const EMPTY_OBJECT: Readonly<{}>;
export declare const defaultGetCacheKey: <P = unknown>(params: P) => Key;
export declare const log: (tag: string, data?: unknown) => void;
export declare const applyEntityChanges: <T extends Typenames>(entities: EntitiesMap<T>, changes: EntityChanges<T>, options: CacheOptions) => EntitiesMap<T> | undefined;
