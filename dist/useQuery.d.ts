import { ActionMap } from './createActions';
import { Cache, QueryMutationState, Typenames, UseQueryOptions } from './types';
export declare const useQuery: <N extends string, T extends Typenames, QP, QR, MP, MR, QK extends keyof QP | keyof QR>(cache: Cache<N, T, QP, QR, MP, MR>, actions: Pick<ActionMap<N, T, QP, QR, MP, MR>, "updateQueryStateAndEntities">, options: UseQueryOptions<T, QP, QR, QK>) => readonly [QueryMutationState<QK extends keyof QP & keyof QR ? QP[QK] : never, QK extends keyof QP & keyof QR ? QR[QK] : never>, (options?: {
    params: QK extends keyof QP & keyof QR ? QP[QK] : never;
} | undefined) => Promise<import("./types").QueryResult<QK extends infer T_1 ? T_1 extends QK ? T_1 extends keyof QP & keyof QR ? QR[T_1] : never : never : never>>];
