import { CacheOptions, EntitiesMap, EntityChanges, Typenames } from './types';
export declare const PACKAGE_SHORT_NAME = "RRC";
export declare const isDev: boolean;
export declare const defaultQueryMutationState: {
    readonly loading: false;
    readonly error: undefined;
};
export declare const defaultGetParamsKey: <P = unknown>(params: P) => string;
export declare const useAssertValueNotChanged: (name: string, value: unknown) => void;
export declare const log: (tag: string, data?: unknown) => void;
/**
 * Apply changes to the entities map.
 * @return `undefined` if nothing to change, otherwise new entities map with applied changes.
 */
export declare const applyEntityChanges: <T extends Typenames>(entities: EntitiesMap<T>, changes: EntityChanges<T>, options: CacheOptions) => EntitiesMap<T> | undefined;
