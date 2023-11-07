import {generateTestBank, generateTestEntitiesMap, generateTestUser} from '../test-utils/api/utils'
import {TestTypenames} from '../test-utils/redux/cache'
import {EntityChanges} from '../types'
import {defaultCacheOptions, processEntityChanges} from '../utilsAndConstants'

test('add new entities', () => {
  const entitiesMap = generateTestEntitiesMap(0)
  const changes: EntityChanges<TestTypenames> = {
    merge: generateTestEntitiesMap(2),
  }

  const result = processEntityChanges(entitiesMap, changes, defaultCacheOptions)

  expect(result).toEqual(generateTestEntitiesMap(2))
})

test('remove entities', () => {
  const entitiesMap = generateTestEntitiesMap(2)
  const changes: EntityChanges<TestTypenames> = {
    remove: {
      users: [1],
      banks: ['1'],
    },
  }

  const result = processEntityChanges(entitiesMap, changes, defaultCacheOptions)

  expect(result).toEqual({
    users: {
      2: generateTestUser(2),
    },
    banks: {
      2: generateTestBank('2'),
    },
  })
})

test('update entities', () => {
  const entitiesMap = generateTestEntitiesMap(2)
  const changes: EntityChanges<TestTypenames> = {
    merge: {
      users: {
        1: {
          name: 'User 1 updated',
        },
      },
      banks: {
        1: {
          name: 'Bank 1 updated',
        },
      },
    },
  }

  const result = processEntityChanges(entitiesMap, changes, defaultCacheOptions)

  expect(result).toEqual({
    users: {
      1: generateTestUser(1, true, ' updated'),
      2: generateTestUser(2),
    },
    banks: {
      1: generateTestBank('1', ' updated'),
      2: generateTestBank('2'),
    },
  })
})

test('replace entities', () => {
  const entitiesMap = generateTestEntitiesMap(2)
  const changes: EntityChanges<TestTypenames> = {
    replace: {
      users: {
        1: generateTestUser(1, false),
      },
      banks: {
        1: generateTestBank('1', ' replaced'),
      },
    },
  }

  const result = processEntityChanges(entitiesMap, changes, defaultCacheOptions)

  expect(result).toEqual({
    users: {
      1: generateTestUser(1, false),
      2: generateTestUser(2),
    },
    banks: {
      1: generateTestBank('1', ' replaced'),
      2: generateTestBank('2'),
    },
  })
})

test('add, remove, update and replace entities', () => {
  const entitiesMap = generateTestEntitiesMap(3)
  const changes: EntityChanges<TestTypenames> = {
    merge: {
      users: {
        2: generateTestUser(2, true, ' updated'),
      },
      banks: {
        2: generateTestBank('2', ' updated'),
        4: generateTestBank('4'),
      },
    },
    replace: {
      users: {
        3: generateTestUser(3, false),
      },
      banks: {
        3: generateTestBank('3', ' replaced'),
      },
    },
    remove: {
      users: [1],
      banks: ['1'],
    },
  }

  const result = processEntityChanges(entitiesMap, changes, defaultCacheOptions)

  expect(result).toEqual({
    users: {
      2: generateTestUser(2, true, ' updated'),
      3: generateTestUser(3, false),
    },
    banks: {
      2: generateTestBank('2', ' updated'),
      3: generateTestBank('3', ' replaced'),
      4: generateTestBank('4'),
    },
  })
})

test('return undefined with empty arguments', () => {
  const entitiesMap = generateTestEntitiesMap(1)
  const changes: EntityChanges<TestTypenames> = {}
  const changes2: EntityChanges<TestTypenames> = {
    merge: {},
    remove: {},
    replace: {},
  }
  const changes3: EntityChanges<TestTypenames> = {
    remove: {
      banks: [],
      users: [],
    },
  }

  const result = processEntityChanges(entitiesMap, changes, defaultCacheOptions)
  const result2 = processEntityChanges(entitiesMap, changes2, defaultCacheOptions)
  const result3 = processEntityChanges(entitiesMap, changes3, defaultCacheOptions)

  expect(result).toEqual(undefined)
  expect(result2).toEqual(undefined)
  expect(result3).toEqual(undefined)
})

test('throw error if merge and entities both set', () => {
  const entitiesMap = generateTestEntitiesMap(1)
  const changes: EntityChanges<TestTypenames> = {
    merge: {
      users: {
        1: generateTestUser(1),
      },
    },
    entities: {
      users: {
        2: generateTestUser(2),
      },
    },
  }

  expect(() => {
    processEntityChanges(entitiesMap, changes, defaultCacheOptions)
  }).toThrowError('Merge and entities should not be both set')
})

test('throw error if merge, replace or remove have intersections', () => {
  const entitiesMap = generateTestEntitiesMap(1)
  const changes: EntityChanges<TestTypenames> = {
    merge: {
      users: {1: generateTestUser(1)},
    },
    replace: {
      users: {1: generateTestUser(1)},
    },
  }
  const changes2: EntityChanges<TestTypenames> = {
    merge: {
      users: {1: generateTestUser(1)},
    },
    remove: {users: [1]},
  }
  const changes3: EntityChanges<TestTypenames> = {
    merge: generateTestEntitiesMap(2),
    replace: generateTestEntitiesMap(2),
    remove: {
      banks: [1],
    },
  }

  ;[changes, changes2, changes3].forEach((changes) => {
    expect(() => {
      processEntityChanges(entitiesMap, changes, defaultCacheOptions)
    }).toThrowError('Merge, replace and remove changes have intersections for: users')
  })
})
