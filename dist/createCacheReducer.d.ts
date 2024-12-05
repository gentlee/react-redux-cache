import type { Actions } from './createActions';
import type { CacheOptions, ReduxCacheState, Typenames } from './types';
export declare const createCacheReducer: <N extends string, T extends Typenames, QP, QR, MP, MR>(actions: Actions<N, T, QP, QR, MP, MR>, queryKeys: (keyof (QP | QR))[], cacheOptions: CacheOptions) => (state: ReduxCacheState<T, QP, QR, MP, MR> | undefined, action: ReturnType<(typeof actions)[keyof typeof actions]>) => ReduxCacheState<T, QP, QR, MP, MR>;
