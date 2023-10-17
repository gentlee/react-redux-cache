/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

type User = {id: number}

const getUser = async ({id}: {id: number}): Promise<User> => ({
  id,
})

const getUsers = async ({page = 1, pageSize = 5}): Promise<User[]> => []

type QueryInfo<P, R> = {
  query: (params: P) => Promise<R>
  mergeResults: (oldResult: R, newResult: R, params: P) => R
}

const makeQueries = <T extends Record<keyof T, any>, Q extends Record<keyof T, any>>(queries: {
  [K in keyof T]: QueryInfo<T[K], Q[K]>
}) => queries

const queries = makeQueries({
  getUsers: {
    query: getUsers,
    mergeResults: (oldResult, newResult, params) => newResult, // results has type `any`, params are properly typed
  },
  getUser: {
    query: getUser,
    mergeResults: (oldResult, newResult, params) => newResult, // results has type `any`, params are properly typed
  },
})

// queries results have `any` type
queries.getUser.query
queries.getUsers.query

type QueryInfo1<K extends string, P, R> = {
  key: K
  query: (params: P) => Promise<R>
  mergeResults: (oldResult: R, newResult: R, params: P) => R
}

const makeQueries1 = <Q extends readonly QueryInfo1<any, any, any>[]>(queries: Q) => queries

const queries1 = makeQueries1([
  {
    key: 'getUsers',
    query: getUsers,
    mergeResults: (oldResult, newResult, params) => newResult, // results has type `any`, params are properly typed
  },
  {
    key: 'getUser',
    query: getUser,
    mergeResults: (oldResult, newResult, params) => newResult, // results has type `any`, params are properly typed
  },
] as const)

// queries results have `any` type
queries1[0].query
queries1[0].query
