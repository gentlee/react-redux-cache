/// <reference types="react" />
import { CacheOptions, EntitiesMap, EntityChanges, Typenames } from './types';
export declare const PACKAGE_NAME = "redux-cache";
export declare const isDev: boolean;
export declare const defaultEndpointState: {
    readonly loading: false;
};
export declare const defaultGetParamsKey: <P = any>(params: P) => string;
/**
 * @returns function to force update a function component.
 */
export declare const useForceUpdate: () => import("react").DispatchWithoutAction;
export declare const useAssertValueNotChanged: (name: string, value: any) => void;
/**
 * Process changes to entities map.
 * @return `undefined` if nothing to change, otherwise processed entities map.
 */
export declare const processEntityChanges: <T extends Typenames>(entities: EntitiesMap<T>, changes: EntityChanges<T>, options: CacheOptions) => EntitiesMap<T> | undefined;
