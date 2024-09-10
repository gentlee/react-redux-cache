import { Store } from 'redux';
import type { ActionMap } from './createActions';
import type { Cache, Key, QueryResult, Typenames } from './types';
export declare const query: <N extends string, T extends Typenames, QP, QR, MP, MR, QK extends keyof QP | keyof QR>(logTag: string, store: Store, cache: Cache<N, T, QP, QR, MP, MR>, { updateQueryStateAndEntities, }: Pick<ActionMap<N, T, QP, QR, unknown, unknown>, "updateQueryStateAndEntities">, queryKey: QK, cacheKey: Key, params: QK extends keyof QP & keyof QR ? QP[QK] : never) => Promise<QueryResult<QK extends keyof QP & keyof QR ? QR[QK] : never>>;
