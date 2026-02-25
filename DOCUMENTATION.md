### Create cache

| Symbol | Description |
|--------|---------------|
| withTypenames | Function to provide generic Typenames if normalization is needed - this is a Typescript limitation.  Returns object with createCache function with provided typenames.  @example  `const cache = withTypenames<MyTypenames>().createCache({...})` |
| createCache | Creates reducer, actions and hooks for managing queries and mutations. |

##### createCache result

| Symbol | Description |
|--------|---------------|
| config | Keeps config, passed while creating the cache, with default values set. |

##### selectors

| Symbol | Description |
|--------|---------------|
| selectCacheState | Selects cache state from root state. Depends on `cacheStateKey`. |
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

##### utils

| Symbol | Description |
|--------|---------------|
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


### React – create hooks

| Symbol | Description |
|--------|---------------|
| useClient | Returns memoized object with query and mutate functions. Memoization dependency is the store. |
| useQuery | Fetches query when params change and subscribes to query state changes (subscription depends on `selectorComparer`). |
| useMutation | Subscribes to provided mutation state and provides mutate function. |
| useSelectEntityById | useSelector + selectEntityById. |
| useEntitiesByTypename | useSelector + selectEntitiesByTypename. Also subscribes to collection's change key if `mutableCollections` enabled.  @warning Subscribing to collections should be avoided. |


### Redux

| Symbol | Description |
|--------|---------------|
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

##### utils

| Symbol | Description |
|--------|---------------|
| createClient | Creates client by providing the store. Can be used when the store is a singleton for direct client import. |
| setCustomStoreHooks | Can be used to override defaut hooks, imported from "react-redux" package. |


### Zustand

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

##### utils

| Symbol | Description |
|--------|---------------|
| getInitialState | Generates the initial state. |
| createClient | Creates client by providing the store. Can be used when the store is a singleton for direct client import. |

