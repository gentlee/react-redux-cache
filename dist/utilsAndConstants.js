"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEntityChanges = exports.log = exports.useAssertValueNotChanged = exports.useForceUpdate = exports.defaultGetParamsKey = exports.defaultEndpointState = exports.isDev = exports.PACKAGE_SHORT_NAME = void 0;
const react_1 = require("react");
const react_2 = require("react");
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
exports.defaultEndpointState = { loading: false };
const defaultGetParamsKey = (params) => !params ? '' : JSON.stringify(params);
exports.defaultGetParamsKey = defaultGetParamsKey;
const forceUpdateReducer = (i) => i + 1;
/**
 * @returns function to force update a function component.
 */
const useForceUpdate = () => {
    return (0, react_2.useReducer)(forceUpdateReducer, 0)[1];
};
exports.useForceUpdate = useForceUpdate;
const useAssertValueNotChanged = (name, value) => {
    const firstMountRef = (0, react_1.useRef)(false);
    (0, react_1.useMemo)(() => {
        if (firstMountRef.current) {
            throw new Error(`${name} should not be modified`);
        }
        firstMountRef.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
};
exports.useAssertValueNotChanged = useAssertValueNotChanged;
const log = (tag, data) => {
    console.debug(`@${exports.PACKAGE_SHORT_NAME} [${tag}]`, data);
};
exports.log = log;
/**
 * Process changes to entities map.
 * @return `undefined` if nothing to change, otherwise processed entities map.
 */
const processEntityChanges = (entities, changes, options) => {
    var _a, _b, _c;
    const { merge = changes.entities, replace, remove } = changes;
    if (!merge && !replace && !remove) {
        return undefined;
    }
    if (options.validateFunctionArguments) {
        // check for merge and entities both set
        if (changes.merge && changes.entities) {
            throw new Error('Response merge and entities should not be both set');
        }
        // check for key intersection
        const mergeKeys = merge && Object.keys(merge);
        const replaceKeys = replace && Object.keys(replace);
        const removeKeys = remove && Object.keys(remove);
        const keysSet = new Set(mergeKeys);
        replaceKeys === null || replaceKeys === void 0 ? void 0 : replaceKeys.forEach((key) => keysSet.add(key));
        removeKeys === null || removeKeys === void 0 ? void 0 : removeKeys.forEach((key) => keysSet.add(key));
        const totalKeysInResponse = ((_a = mergeKeys === null || mergeKeys === void 0 ? void 0 : mergeKeys.length) !== null && _a !== void 0 ? _a : 0) + ((_b = replaceKeys === null || replaceKeys === void 0 ? void 0 : replaceKeys.length) !== null && _b !== void 0 ? _b : 0) + ((_c = removeKeys === null || removeKeys === void 0 ? void 0 : removeKeys.length) !== null && _c !== void 0 ? _c : 0);
        if (keysSet.size !== totalKeysInResponse) {
            throw new Error('Merge, replace and remove keys should not intersect');
        }
    }
    let result;
    for (const typename in entities) {
        const entitiesToMerge = merge === null || merge === void 0 ? void 0 : merge[typename];
        const entitiesToReplace = replace === null || replace === void 0 ? void 0 : replace[typename];
        const entitiesToRemove = remove === null || remove === void 0 ? void 0 : remove[typename];
        if (!entitiesToMerge && !entitiesToReplace && !entitiesToRemove) {
            continue;
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
    (0, exports.log)('processEntityChanges', {
        entities,
        changes,
        result,
    });
    return result;
};
exports.processEntityChanges = processEntityChanges;
