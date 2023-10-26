import { Cache, MutationCacheOptions, QueryMutationState, Typenames } from './types';
export declare const DEFAULT_MUTATION_CACHE_OPTIONS: MutationCacheOptions;
export declare const useMutation: <T extends Typenames, MP, MR, MK extends keyof MP | keyof MR>(cache: Cache<T, any, any, MP, MR>, options: {
    mutation: MK;
    cacheOptions?: MutationCacheOptions | undefined;
}) => readonly [(params: MK extends keyof MP & keyof MR ? MP[MK] : never) => Promise<void>, QueryMutationState<MK extends keyof MP & keyof MR ? MP[MK] : never>, AbortController | undefined];
