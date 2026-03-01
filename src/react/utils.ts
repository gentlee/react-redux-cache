import {CacheExtensions} from '../typesPrivate'
import {PACKAGE_SHORT_NAME} from '../utilsAndConstants'

export const validateStoreHooks = (extensions: CacheExtensions | undefined) => {
  if (extensions?.react?.storeHooks === undefined) {
    throw new Error(
      `@${PACKAGE_SHORT_NAME} Cache wasn't initialized for react. Check initializeForReact function.`,
    )
  }
}
