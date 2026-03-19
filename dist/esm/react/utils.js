import {PACKAGE_SHORT_NAME} from '../utilsAndConstants'

export const validateStoreHooks = (extensions) => {
  var _a
  if (
    ((_a = extensions === null || extensions === void 0 ? void 0 : extensions.react) === null || _a === void 0
      ? void 0
      : _a.storeHooks) === undefined
  ) {
    throw new Error(
      `@${PACKAGE_SHORT_NAME} Cache wasn't initialized for react. Check initializeForReact function.`,
    )
  }
}
