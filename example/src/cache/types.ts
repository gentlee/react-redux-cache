import {mutableNormalized} from './redux/mutable-normalized'
import {normalized} from './redux/normalized'
import {notNormalized} from './redux/not-normalized'
import {notNormalizedOptimized} from './redux/not-normalized-optimized'
import {zustandNormalized} from './zustand/normalized'
import {zustandNotNormalizedOptimized} from './zustand/not-normalized-optimized'

export type NormalizedCache = typeof normalized | typeof mutableNormalized | typeof zustandNormalized

export type NotNormalizedCache =
  | typeof notNormalized
  | typeof notNormalizedOptimized
  | typeof zustandNotNormalizedOptimized
