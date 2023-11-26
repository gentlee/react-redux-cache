import { Cache, QueryCacheOptions, QueryCachePolicy, QueryMutationState, Typenames, UseQueryOptions } from './types';
export declare const queryCacheOptionsByPolicy: Record<QueryCachePolicy, QueryCacheOptions>;
export declare const defaultQueryCacheOptions: {
    readonly policy: "cache-first";
    readonly cacheQueryState: true;
    readonly cacheEntities: true;
};
export declare const useQuery: <T extends Typenames, QP, QR, MP, MR, QK extends keyof QP | keyof QR>(cache: Cache<T, QP, QR, MP, MR>, options: UseQueryOptions<T, QP, QR, MP, MR, QK>) => readonly [QueryMutationState<QK extends keyof QP & keyof QR ? QR[QK] : never>, () => Promise<void | import("./types").QueryResult<QK extends infer T_1 ? T_1 extends QK ? T_1 extends keyof QP & keyof QR ? QR[T_1] : never : never : never>>];
