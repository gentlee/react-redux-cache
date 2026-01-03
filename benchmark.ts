import {createCache} from './src'

const {
  reducer: immutableReducer,
  utils: {getInitialState},
} = createCache({name: 'cache'})

const {reducer: mutableReducer} = createCache({name: 'cache', options: {mutableCollections: true}})

const results: Record<string, Record<number, number>> = {}

const benchmark = (
  name: 'mutable' | 'immutable',
  reducer: typeof immutableReducer,
  initialCollectionSize: number,
  isWarmup = false
) => {
  {
    // Warmup

    if (!isWarmup) {
      benchmark(name, reducer, 1000, true)
    }

    // Setup

    let state: ReturnType<typeof reducer> = {
      ...getInitialState(),
      entities: {
        users: Array.from({length: initialCollectionSize})
          .map((_, i) => ({id: i, name: String(i), bankId: String(i)}))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .reduce((r, x) => ((r[x.id] = x), r), {} as any),
      },
    }

    const run = (id: number) => {
      state = reducer(state, {
        type: '@rrc/cache/mergeEntityChanges',
        changes: {replace: {users: {[id]: {id}}}},
      })
    }

    globalThis.gc?.()

    // Measurement

    const addCount = 300
    const start = performance.now()
    for (let i = 0; i < addCount; i += 1) {
      run(i + initialCollectionSize)
    }

    // Log Results

    if (!isWarmup) {
      const result = ((performance.now() - start) / addCount) * 1000
      results[name] ??= {}
      results[name][initialCollectionSize] = Number(result.toFixed(2))
    }
  }

  globalThis.gc?.()
}

for (let i = 0, size = [0, 1000, 10_000, 100_000, 1000_000]; i < size.length; i += 1) {
  benchmark('immutable', immutableReducer, size[i])
  benchmark('mutable', mutableReducer, size[i])
}

console.table(results)
