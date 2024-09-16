"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyEntityChanges = exports.log = exports.defaultGetCacheKey = exports.DEFAULT_QUERY_MUTATION_STATE = exports.IS_DEV = exports.optionalUtils = exports.PACKAGE_SHORT_NAME = void 0;
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
exports.DEFAULT_QUERY_MUTATION_STATE = { loading: false };
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
    const deepEqual = options.deepComparisonEnabled ? exports.optionalUtils.deepEqual : undefined;
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
        const oldEntities = entities[typename];
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
        result[typename] = newEntities;
    }
    options.logsEnabled &&
        (0, exports.log)('applyEntityChanges', {
            entities,
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            changes: require('util').inspect(changes, { depth: 4 }),
            options,
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            result: require('util').inspect(result, { depth: 4 }),
        });
    return result;
};
exports.applyEntityChanges = applyEntityChanges;
