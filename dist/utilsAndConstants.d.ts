/// <reference types="react" />
import { CacheOptions, EntitiesMap, EntityChanges, Typenames } from './types';
export declare const PACKAGE_SHORT_NAME = "RRC";
export declare const isDev: boolean;
export declare const defaultEndpointState: {
    readonly loading: false;
};
export declare const defaultGetParamsKey: <P = unknown>(params: P) => string;
/**
 * @returns function to force update a function component.
 */
export declare const useForceUpdate: () => import("react").DispatchWithoutAction;
export declare const useAssertValueNotChanged: (name: string, value: unknown) => void;
export declare const log: (tag: string, data: unknown) => void;
/**
 * Process changes to entities map.
 * @return `undefined` if nothing to change, otherwise processed entities map.
 */
export declare const processEntityChanges: <T extends Typenames>(entities: EntitiesMap<T>, changes: EntityChanges<T>, options: CacheOptions) => EntitiesMap<T> | undefined;
