import { Cache, Key, MutationState, QueryState, Typenames } from './types';
export type Selectors<N extends string = string, T extends Typenames = Typenames, QP = unknown, QR = unknown, MP = unknown, MR = unknown> = ReturnType<typeof createSelectors<N, T, QP, QR, MP, MR>>;
export declare const createSelectors: <N extends string, T extends Typenames, QP, QR, MP, MR>(cache: Cache<N, T, QP, QR, MP, MR>) => {
    selectQueryState: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => QueryState<T, QK extends keyof (QP | QR) ? QP[QK] : never, QK extends keyof (QP | QR) ? QR[QK] : never>;
    selectQueryResult: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => (QK extends keyof QP & keyof QR ? QR[QK] : never) | undefined;
    selectQueryLoading: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => false | Promise<import("./types").NormalizedQueryResponse<T, QK extends keyof QP & keyof QR ? QR[QK] : never>>;
    selectQueryError: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => Error | undefined;
    selectQueryParams: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => (QK extends keyof QP & keyof QR ? QP[QK] : never) | undefined;
    selectQueryExpiresAt: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => number | undefined;
    selectMutationState: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => MutationState<T, MK extends keyof (MP | MR) ? MP[MK] : never, MK extends keyof (MP | MR) ? MR[MK] : never>;
    selectMutationResult: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => (MK extends keyof MP & keyof MR ? MR[MK] : never) | undefined;
    selectMutationLoading: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => false | Promise<import("./types").NormalizedQueryResponse<T, MK extends keyof MP & keyof MR ? MR[MK] : never>>;
    selectMutationError: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => Error | undefined;
    selectMutationParams: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => (MK extends keyof MP & keyof MR ? MP[MK] : never) | undefined;
    selectEntityById: <TN extends keyof T>(state: unknown, id: Key | null | undefined, typename: TN) => T[TN] | undefined;
    selectEntities: (state: unknown) => import("./types").EntitiesMap<T>;
    selectEntitiesByTypename: <TN extends keyof T>(state: unknown, typename: TN) => import("./types").EntitiesMap<T>[TN];
};
