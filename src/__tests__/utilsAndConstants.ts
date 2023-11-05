import {EntityChanges} from '../types'
import {EntitiesMap} from '../types'
import {processEntityChanges} from '../utilsAndConstants'

test('processEntityChanges should add new entities', () => {
  const entitiesMap = generateTestEntitiesMap(0)
  const changes: EntityChanges<TestTypenames> = {
    merge: generateTestEntitiesMap(2),
  }

  const result = processEntityChanges(entitiesMap, changes, testOptions)

  expect(result).toEqual(generateTestEntitiesMap(2))
})

test('processEntityChanges should remove entities', () => {
  const entitiesMap = generateTestEntitiesMap(2)
  const changes: EntityChanges<TestTypenames> = {
    remove: {
      users: [1],
      banks: ['1'],
    },
  }

  const result = processEntityChanges(entitiesMap, changes, testOptions)

  expect(result).toEqual({
    users: {
      2: generateTestUser(2),
    },
    banks: {
      2: generateTestBank('2'),
    },
  })
})

test('processEntityChanges should update entities', () => {
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

  const result = processEntityChanges(entitiesMap, changes, testOptions)

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

test('processEntityChanges should replace entities', () => {
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

  const result = processEntityChanges(entitiesMap, changes, testOptions)

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

test('processEntityChanges should add, remove, update and replace entities', () => {
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

  const result = processEntityChanges(entitiesMap, changes, testOptions)

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

test('processEntityChanges should return undefined with empty arguments', () => {
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

  const result = processEntityChanges(entitiesMap, changes, testOptions)
  const result2 = processEntityChanges(entitiesMap, changes2, testOptions)
  const result3 = processEntityChanges(entitiesMap, changes3, testOptions)

  expect(result).toEqual(undefined)
  expect(result2).toEqual(undefined)
  expect(result3).toEqual(undefined)
})

test('processEntityChanges should throw error if merge and entities both set', () => {
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
    processEntityChanges(entitiesMap, changes, testOptions)
  }).toThrowError('Merge and entities should not be both set')
})

test('processEntityChanges should throw error if merge, replace or remove have intersections', () => {
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
      processEntityChanges(entitiesMap, changes, testOptions)
    }).toThrowError('Merge, replace and remove changes have intersections for: users')
  })
})

// types

export type User = {
  id: number
  bankId: string
  name?: string
}

export type Bank = {
  id: string
  name: string
}

export type TestTypenames = {
  users: User
  banks: Bank
}

// constants

const testOptions = {
  logsEnabled: false,
  validateFunctionArguments: true,
  validateHookArguments: true,
}

// utils

export const generateTestUser = (id: number, full = true, nameSuffix = ''): User => {
  const user: User = {
    id,
    bankId: String(id),
  }
  if (full) {
    user.name = `User ${id}` + nameSuffix
  }
  return user
}

export const generateTestBank = (id: string, nameSuffix = ''): Bank => {
  return {
    id,
    name: 'Bank ' + id + nameSuffix,
  }
}

export const generateTestEntitiesMap = (size: number, full = true): EntitiesMap<TestTypenames> => {
  const users = Array.from({length: size}, (_, i) => generateTestUser(i + 1, full))
  const banks = Array.from({length: size}, (_, i) => generateTestBank(String(i + 1)))

  return {
    users: mapFromArray(users, 'id'),
    banks: mapFromArray(banks, 'id'),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapFromArray = <T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T> => {
  return array.reduce((acc, item) => {
    acc[item[key]] = item
    return acc
  }, {} as Record<string, T>)
}
