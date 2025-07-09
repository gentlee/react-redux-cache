"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyObject = exports.applyEntityChanges = exports.FetchPolicy = exports.log = exports.defaultGetCacheKey = exports.NOOP = exports.EMPTY_ARRAY = exports.EMPTY_OBJECT = exports.IS_DEV = exports.optionalUtils = exports.PACKAGE_SHORT_NAME = void 0;
exports.PACKAGE_SHORT_NAME = 'rrc';
exports.optionalUtils = {
    deepEqual: undefined,
};
try {
    exports.optionalUtils.deepEqual = require('fast-deep-equal/es6');
}
catch (_a) {
    console.debug(exports.PACKAGE_SHORT_NAME + ': fast-deep-equal optional dependency was not installed');
}
exports.IS_DEV = (() => {
    try {
        // @ts-expect-error __DEV__ is only for React Native
        return __DEV__;
    }
    catch (e) {
        return process.env.NODE_ENV === 'development';
    }
})();
exports.EMPTY_OBJECT = Object.freeze({});
exports.EMPTY_ARRAY = Object.freeze([]);
// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = () => { };
exports.NOOP = NOOP;
const defaultGetCacheKey = (params) => {
    switch (typeof params) {
        case 'string':
        case 'symbol':
            return params;
        case 'object':
            return JSON.stringify(params);
        default:
            return String(params);
    }
};
exports.defaultGetCacheKey = defaultGetCacheKey;
const log = (tag, data) => {
    console.debug(`@${exports.PACKAGE_SHORT_NAME} [${tag}]`, data);
};
exports.log = log;
exports.FetchPolicy = {
    /** Only if cache does not exist (result is undefined) or expired. */
    NoCacheOrExpired: (expired, _params, state) => {
        return expired || state.result === undefined;
    },
    /** Every fetch trigger. */
    Always: () => true,
};
const applyEntityChanges = (entities, changes, options) => {
    var _a, _b, _c, _d;
    if (changes.merge && changes.entities) {
        console.warn('react-redux-cache.applyEntityChanges: merge and entities should not be both set');
    }
    const { merge = changes.entities, replace, remove } = changes;
    if (!merge && !replace && !remove) {
        return undefined;
    }
    const deepEqual = options.deepComparisonEnabled ? exports.optionalUtils.deepEqual : undefined;
    let result;
    // TODO refactor to remove this Set
    const typenames = new Set([
        ...(changes.entities ? Object.keys(changes.entities) : exports.EMPTY_ARRAY),
        ...(changes.merge ? Object.keys(changes.merge) : exports.EMPTY_ARRAY),
        ...(changes.remove ? Object.keys(changes.remove) : exports.EMPTY_ARRAY),
        ...(changes.replace ? Object.keys(changes.replace) : exports.EMPTY_ARRAY),
    ]);
    for (const typename of typenames) {
        const entitiesToMerge = merge === null || merge === void 0 ? void 0 : merge[typename];
        const entitiesToReplace = replace === null || replace === void 0 ? void 0 : replace[typename];
        const entitiesToRemove = remove === null || remove === void 0 ? void 0 : remove[typename];
        if (!entitiesToMerge && !entitiesToReplace && !(entitiesToRemove === null || entitiesToRemove === void 0 ? void 0 : entitiesToRemove.length)) {
            continue;
        }
        // check for key intersection
        if (options.additionalValidation) {
            const mergeIds = entitiesToMerge && Object.keys(entitiesToMerge);
            const replaceIds = entitiesToReplace && Object.keys(entitiesToReplace);
            const idsSet = new Set(mergeIds);
            replaceIds === null || replaceIds === void 0 ? void 0 : replaceIds.forEach((id) => idsSet.add(id));
            entitiesToRemove === null || entitiesToRemove === void 0 ? void 0 : entitiesToRemove.forEach((id) => idsSet.add(String(id))); // String() because Object.keys always returns strings
            const totalKeysInResponse = ((_a = mergeIds === null || mergeIds === void 0 ? void 0 : mergeIds.length) !== null && _a !== void 0 ? _a : 0) + ((_b = replaceIds === null || replaceIds === void 0 ? void 0 : replaceIds.length) !== null && _b !== void 0 ? _b : 0) + ((_c = entitiesToRemove === null || entitiesToRemove === void 0 ? void 0 : entitiesToRemove.length) !== null && _c !== void 0 ? _c : 0);
            if (totalKeysInResponse !== 0 && idsSet.size !== totalKeysInResponse) {
                console.warn('react-redux-cache.applyEntityChanges: merge, replace and remove changes have intersections for: ' +
                    typename);
            }
        }
        const oldEntities = (_d = entities[typename]) !== null && _d !== void 0 ? _d : exports.EMPTY_OBJECT;
        let newEntities;
        // remove
        entitiesToRemove === null || entitiesToRemove === void 0 ? void 0 : entitiesToRemove.forEach((id) => {
            if (oldEntities[id]) {
                newEntities !== null && newEntities !== void 0 ? newEntities : (newEntities = Object.assign({}, oldEntities));
                delete newEntities[id];
            }
        });
        // replace
        if (entitiesToReplace) {
            for (const id in entitiesToReplace) {
                const newEntity = entitiesToReplace[id];
                if (!(deepEqual === null || deepEqual === void 0 ? void 0 : deepEqual(oldEntities[id], newEntity))) {
                    newEntities !== null && newEntities !== void 0 ? newEntities : (newEntities = Object.assign({}, oldEntities));
                    newEntities[id] = newEntity;
                }
            }
        }
        // merge
        if (entitiesToMerge) {
            for (const id in entitiesToMerge) {
                const oldEntity = oldEntities[id];
                const newEntity = Object.assign(Object.assign({}, oldEntity), entitiesToMerge[id]);
                if (!(deepEqual === null || deepEqual === void 0 ? void 0 : deepEqual(oldEntity, newEntity))) {
                    newEntities !== null && newEntities !== void 0 ? newEntities : (newEntities = Object.assign({}, oldEntities));
                    newEntities[id] = newEntity;
                }
            }
        }
        if (!newEntities) {
            continue;
        }
        result !== null && result !== void 0 ? result : (result = Object.assign({}, entities));
        // @ts-expect-error fix later
        result[typename] = newEntities;
    }
    options.logsEnabled &&
        (0, exports.log)('applyEntityChanges', {
            entities,
            changes,
            options,
            result,
        });
    return result;
};
exports.applyEntityChanges = applyEntityChanges;
const isEmptyObject = (o) => {
    for (const _ in o) {
        return false;
    }
    return true;
};
exports.isEmptyObject = isEmptyObject;
