### Create cache

| Symbol | Description |
|--------|---------------|
| withTypenames | Function to provide generic Typenames if normalization is needed - this is a Typescript limitation.  Returns object with createCache function with provided typenames.  @example  `const cache = withTypenames<MyTypenames>().createCache({...})` |
| createCache | Creates reducer, actions and hooks for managing queries and mutations. |

##### client

| Symbol | Description |
|--------|---------------|
| query | Performs a query using provided options. Deduplicates calls with the same cache key. Always returns current cached result, even when query is cancelled or finished with error.  @param onlyIfExpired When true, cancels fetch if result is not yet expired.  @param skipFetch Fetch is cancelled and current cached result is returned. |
| mutate | Performs a mutation, aborting previous one with the same mutation key. Returns result only if finished succesfully. |

##### createCache result

| Symbol | Description |
|--------|---------------|
| cache | Keeps all options, passed while creating the cache. |
| reducer | Reducer of the cache, should be added to redux/zustand store. |

##### actions

| Symbol | Description |
|--------|---------------|
| updateQueryStateAndEntities | Updates query state, and optionally merges entity changes in a single action. |
| updateMutationStateAndEntities | Updates mutation state, and optionally merges entity changes in a single action. |
| mergeEntityChanges | Merges EntityChanges to the state. |
| invalidateQuery | Sets expiresAt to Date.now(). |
| clearQueryState | Clears states for provided query keys and cache keys.  If cache key for query key is not provided, the whole state for query key is cleared. |
| clearMutationState | Clears states for provided mutation keys. |
| clearCache | Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and should be used with caution. |

##### selectors

| Symbol | Description |
|--------|---------------|
| selectCacheState | This is a cacheStateSelector from createCache options, or default one if was not provided. |
| selectQueryState | Selects query state. |
| selectQueryResult | Selects query latest result. |
| selectQueryLoading | Selects query loading state. |
| selectQueryError | Selects query latest error. |
| selectQueryParams | Selects query latest params. |
| selectQueryExpiresAt | Selects query latest expiresAt. |
| selectMutationState | Selects mutation state. |
| selectMutationResult | Selects mutation latest result. |
| selectMutationLoading | Selects mutation loading state. |
| selectMutationError | Selects mutation latest error. |
| selectMutationParams | Selects mutation latest params. |
| selectEntityById | Selects entity by id and typename. |
| selectEntities | Selects all entities. |
| selectEntitiesByTypename | Selects all entities of provided typename. |

##### hooks

| Symbol | Description |
|--------|---------------|
| useClient | Returns memoized object with query and mutate functions. Memoization dependency is the store. |
| useQuery | Fetches query when params change and subscribes to query state changes (subscription depends on `selectorComparer`). |
| useMutation | Subscribes to provided mutation state and provides mutate function. |
| useSelectEntityById | useSelector + selectEntityById. |
| useEntitiesByTypename | useSelector + selectEntitiesByTypename. Also subscribes to collection's change key if `mutableCollections` enabled.  @warning Subscribing to collections should be avoided. |

##### utils

| Symbol | Description |
|--------|---------------|
| createClient | Creates client by providing the store. Can be used when the store is a singleton - to not use a useClient hook for getting the client, but import it directly. |
| getInitialState | Generates the initial state by calling a reducer. Not needed for redux — it already generates it the same way when creating the store. |
| applyEntityChanges | Apply changes to the entities map.  Returns `undefined` if nothing to change, otherwise new `EntitiesMap<T>` with applied changes.  Uses deep comparison if `deepComparisonEnabled` option is `true`.  Performs additional checks for intersections if `additionalValidation` option is `true`, and prints warnings if finds any issues. |


### Utils and constants

| Symbol | Description |
|--------|---------------|
| noop | Empty function. |
| defaultGetCacheKey | Default getCacheKey implementation. |
| isEmptyObject | Returns true if object has no keys. |
| createStateComparer | Returns query state comparer that compares only provided fields. Used in implementation of `selectorComparer` option. |

##### FetchPolicy

| Symbol | Description |
|--------|---------------|
| NoCacheOrExpired | Only if cache does not exist (result is undefined) or expired. Default.  @param expired `true` when `expiresAt` is defined and lower than `Date.now()` |
| Always | Every fetch trigger. |

