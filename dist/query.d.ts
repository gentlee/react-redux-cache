import { Store } from 'redux';
import type { Cache, Key, QueryResult, Typenames } from './types';
export declare const query: <T extends Typenames, QP, QR, MP, MR, QK extends keyof QP | keyof QR>(logTag: string, returnResult: boolean, store: Store, cache: Cache<T, QP, QR, MP, MR>, queryKey: QK, cacheKey: Key, params: QK extends keyof QP & keyof QR ? QP[QK] : never) => Promise<void | QueryResult<QK extends keyof QP & keyof QR ? QR[QK] : never>>;
