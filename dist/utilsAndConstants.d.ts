import type { CacheOptions, EntitiesMap, EntityChanges, Key, Typenames } from './types';
export declare const PACKAGE_SHORT_NAME = "rrc";
export declare const IS_DEV: boolean;
export declare const DEFAULT_QUERY_MUTATION_STATE: {
    readonly loading: false;
    readonly error: undefined;
};
export declare const defaultGetCacheKey: <P = unknown>(params: P) => Key;
export declare const log: (tag: string, data?: unknown) => void;
/**
 * Apply changes to the entities map.
 * @return `undefined` if nothing to change, otherwise new entities map with applied changes.
 */
export declare const applyEntityChanges: <T extends Typenames>(entities: EntitiesMap<T>, changes: EntityChanges<T>, options: CacheOptions) => EntitiesMap<T> | undefined;
