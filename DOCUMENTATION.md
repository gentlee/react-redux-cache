### Create cache
| Symbol | Description |
|--------|---------------|
| withTypenames | Function to provide generic Typenames if normalization is needed - this is a Typescript limitation.  Returns object with createCache function with provided typenames.  @example  `const cache = withTypenames<MyTypenames>().createCache({...})` |
| createCache | Creates reducer, actions and hooks for managing queries and mutations through redux cache. |
| cache | Keeps all options, passed while creating the cache. |
| reducer | Reducer of the cache, should be added to redux store. |

##### actions

| Symbol | Description |
|--------|---------------|
| updateQueryStateAndEntities | Updates query state, and optionally merges entity changes in a single action. |
| updateMutationStateAndEntities | Updates mutation state, and optionally merges entity changes in a single action. |
| mergeEntityChanges | Merges EntityChanges to the state. |
| invalidateQuery | Invalidates query states. |
| clearQueryState | Clears states for provided query keys and cache keys.  If cache key for query key is not provided, the whole state for query key is cleared. |
| clearMutationState | Clears states for provided mutation keys. |
| clearCache | Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and shoult be used with caution. |

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

##### utils

| Symbol | Description |
|--------|---------------|
| createClient | Creates client by providing the store. Can be used when the store is a singleton - to not use a hook for getting the client, but import it directly. |
| getInitialState | Generates the initial state by calling a reducer. Not needed for redux — it already generates it the same way when creating the store. |
| applyEntityChanges | Apply changes to the entities map.  @returns `undefined` if nothing to change, otherwise new `EntitiesMap<T>` with applied changes. |
| createCache | Creates reducer, actions and hooks for managing queries and mutations through redux cache. |


### Utils and constants
| Symbol | Description |
|--------|---------------|
| defaultGetCacheKey | Default getCacheKey implementation. |
| isEmptyObject | Returns true if object has no keys. |
| createStateComparer | Returns query state comparer that compares only provided fields. Used in implementation of `selectorComparer` option. |

##### FetchPolicy

| Symbol | Description |
|--------|---------------|
| NoCacheOrExpired | Only if cache does not exist (result is undefined) or expired. @Default |
| Always | Every fetch trigger. |

