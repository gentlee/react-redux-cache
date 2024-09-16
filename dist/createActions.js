"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActions = void 0;
const utilsAndConstants_1 = require("./utilsAndConstants");
const createActions = (name) => {
    const actionPrefix = `@${utilsAndConstants_1.PACKAGE_SHORT_NAME}/${name}/`;
    const updateQueryStateAndEntitiesType = `${actionPrefix}updateQueryStateAndEntities`;
    const updateQueryStateAndEntities = (queryKey, queryCacheKey, state, entityChanges) => ({
        type: updateQueryStateAndEntitiesType,
        queryKey,
        queryCacheKey,
        state,
        entityChanges,
    });
    updateQueryStateAndEntities.type = updateQueryStateAndEntitiesType;
    const updateMutationStateAndEntitiesType = `${actionPrefix}updateMutationStateAndEntities`;
    const updateMutationStateAndEntities = (mutationKey, state, entityChanges) => ({
        type: updateMutationStateAndEntitiesType,
        mutationKey,
        state,
        entityChanges,
    });
    updateMutationStateAndEntities.type = updateMutationStateAndEntitiesType;
    const mergeEntityChangesType = `${actionPrefix}mergeEntityChanges`;
    const mergeEntityChanges = (changes) => ({
        type: mergeEntityChangesType,
        changes,
    });
    mergeEntityChanges.type = mergeEntityChangesType;
    const clearQueryStateType = `${actionPrefix}clearQueryState`;
    const clearQueryState = (queryKeys) => ({
        type: clearQueryStateType,
        queryKeys,
    });
    clearQueryState.type = clearQueryStateType;
    const clearMutationStateType = `${actionPrefix}clearMutationState`;
    const clearMutationState = (mutationKeys) => ({
        type: clearMutationStateType,
        mutationKeys,
    });
    clearMutationState.type = clearMutationStateType;
    return {
        /** Updates query state, and optionally merges entity changes in a single action. */
        updateQueryStateAndEntities,
        /** Updates mutation state, and optionally merges entity changes in a single action. */
        updateMutationStateAndEntities,
        /** Merge EntityChanges to the state. */
        mergeEntityChanges,
        /** Clear states for provided query keys and cache keys.
         * If cache key for query key is not provided, the whole state for query key is cleared. */
        clearQueryState,
        /** Clear states for provided mutation keys. */
        clearMutationState,
    };
};
exports.createActions = createActions;
