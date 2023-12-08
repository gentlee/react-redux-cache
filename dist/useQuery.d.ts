import { Cache, QueryMutationState, Typenames, UseQueryOptions } from './types';
export declare const useQuery: <T extends Typenames, QP, QR, MP, MR, QK extends keyof QP | keyof QR>(cache: Cache<T, QP, QR, MP, MR>, options: UseQueryOptions<T, QP, QR, MP, MR, QK>) => readonly [QueryMutationState<QK extends keyof QP & keyof QR ? QR[QK] : never>, () => Promise<void>];
