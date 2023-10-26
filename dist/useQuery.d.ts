import { Cache, QueryCacheOptions, QueryCachePolicy, QueryMutationState, Typenames, UseQueryOptions } from './types';
export declare const QUERY_CACHE_OPTIONS_BY_POLICY: Record<QueryCachePolicy, QueryCacheOptions>;
export declare const DEFAULT_QUERY_CACHE_OPTIONS: {
    readonly policy: "cache-first";
    readonly cacheQueryState: true;
    readonly cacheEntities: true;
};
export declare const useQuery: <T extends Typenames, QP, QR, MP, MR, QK extends keyof QP | keyof QR>(cache: Cache<T, QP, QR, MP, MR>, options: UseQueryOptions<T, QP, QR, MP, MR, QK>) => readonly [QueryMutationState<QK extends keyof QP & keyof QR ? QR[QK] : never>, (params?: (QK extends keyof QP & keyof QR ? QP[QK] : never) | undefined) => Promise<void>];
