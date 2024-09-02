import { ActionMap } from './createActions';
import { Cache, QueryMutationState, Typenames, UseQueryOptions } from './types';
export declare const useQuery: <N extends string, T extends Typenames, QP, QR, MP, MR, QK extends keyof QP | keyof QR>(cache: Cache<N, T, QP, QR, MP, MR>, actions: Pick<ActionMap<N, T, QR, MR>, "updateQueryStateAndEntities">, options: UseQueryOptions<T, QP, QR, MR, QK>) => readonly [QueryMutationState<QK extends keyof QP & keyof QR ? QR[QK] : never>, () => Promise<void>];
