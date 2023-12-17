"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyEntityChanges = exports.log = exports.defaultGetCacheKey = exports.defaultQueryMutationState = exports.isDev = exports.PACKAGE_SHORT_NAME = void 0;
exports.PACKAGE_SHORT_NAME = 'RRC';
exports.isDev = (() => {
    try {
        // @ts-expect-error __DEV__ is only for React Native
        return __DEV__;
    }
    catch (e) {
        return process.env.NODE_ENV === 'development';
    }
})();
exports.defaultQueryMutationState = { loading: false, error: undefined };
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
/**
 * Apply changes to the entities map.
 * @return `undefined` if nothing to change, otherwise new entities map with applied changes.
 */
const applyEntityChanges = (entities, changes, options) => {
    var _a, _b, _c;
    if (options.validateFunctionArguments) {
        // check for merge and entities both set
        if (changes.merge && changes.entities) {
            throw new Error('Merge and entities should not be both set');
        }
    }
    const { merge = changes.entities, replace, remove } = changes;
    if (!merge && !replace && !remove) {
        return undefined;
    }
    let result;
    for (const typename in entities) {
        const entitiesToMerge = merge === null || merge === void 0 ? void 0 : merge[typename];
        const entitiesToReplace = replace === null || replace === void 0 ? void 0 : replace[typename];
        const entitiesToRemove = remove === null || remove === void 0 ? void 0 : remove[typename];
        if (!entitiesToMerge && !entitiesToReplace && !(entitiesToRemove === null || entitiesToRemove === void 0 ? void 0 : entitiesToRemove.length)) {
            continue;
        }
        // check for key intersection
        if (options.validateFunctionArguments) {
            const mergeIds = entitiesToMerge && Object.keys(entitiesToMerge);
            const replaceIds = entitiesToReplace && Object.keys(entitiesToReplace);
            const idsSet = new Set(mergeIds);
            replaceIds === null || replaceIds === void 0 ? void 0 : replaceIds.forEach((id) => idsSet.add(id));
            entitiesToRemove === null || entitiesToRemove === void 0 ? void 0 : entitiesToRemove.forEach((id) => idsSet.add(String(id))); // String() because Object.keys always returns strings
            const totalKeysInResponse = ((_a = mergeIds === null || mergeIds === void 0 ? void 0 : mergeIds.length) !== null && _a !== void 0 ? _a : 0) + ((_b = replaceIds === null || replaceIds === void 0 ? void 0 : replaceIds.length) !== null && _b !== void 0 ? _b : 0) + ((_c = entitiesToRemove === null || entitiesToRemove === void 0 ? void 0 : entitiesToRemove.length) !== null && _c !== void 0 ? _c : 0);
            if (totalKeysInResponse !== 0 && idsSet.size !== totalKeysInResponse) {
                throw new Error('Merge, replace and remove changes have intersections for: ' + typename);
            }
        }
        const newEntities = Object.assign({}, entities[typename]);
        // remove
        entitiesToRemove === null || entitiesToRemove === void 0 ? void 0 : entitiesToRemove.forEach((id) => delete newEntities[id]);
        // replace
        if (entitiesToReplace) {
            for (const id in entitiesToReplace) {
                newEntities[id] = entitiesToReplace[id];
            }
        }
        // merge
        if (entitiesToMerge) {
            for (const id in entitiesToMerge) {
                newEntities[id] = Object.assign(Object.assign({}, newEntities[id]), entitiesToMerge[id]);
            }
        }
        result !== null && result !== void 0 ? result : (result = Object.assign({}, entities));
        result[typename] = newEntities;
    }
    options.logsEnabled &&
        (0, exports.log)('applyEntityChanges', {
            entities,
            changes,
            result,
        });
    return result;
};
exports.applyEntityChanges = applyEntityChanges;
