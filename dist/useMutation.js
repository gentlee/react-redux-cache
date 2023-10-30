"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMutation = exports.DEFAULT_MUTATION_CACHE_OPTIONS = void 0;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const reducer_1 = require("./reducer");
const utilsAndConstants_1 = require("./utilsAndConstants");
exports.DEFAULT_MUTATION_CACHE_OPTIONS = {
    cacheMutationState: true,
    cacheEntities: true,
};
const useMutation = (cache, options) => {
    var _a, _b;
    const { mutation: mutationKey, cacheOptions = (_a = cache.mutations[mutationKey].cacheOptions) !== null && _a !== void 0 ? _a : exports.DEFAULT_MUTATION_CACHE_OPTIONS, } = options;
    const dispatch = (0, react_redux_1.useDispatch)();
    cache.options.logsEnabled &&
        (0, utilsAndConstants_1.log)('useMutation', {
            cacheOptions,
        });
    // Check values that should be set once.
    // Can be removed from deps.
    cache.options.validateHookArguments &&
        (() => {
            ;
            [
                ['cache', cache],
                ['cache.options', cache.options],
                ['cache.options.logsEnabled', cache.options.logsEnabled],
                ['cacheStateSelector', cache.cacheStateSelector],
                ['mutationKey', mutationKey],
                ['cacheOptions.cacheEntities', cacheOptions.cacheEntities],
                ['cacheOptions.cacheMutationState', cacheOptions.cacheMutationState],
            ]
                // eslint-disable-next-line react-hooks/rules-of-hooks
                .forEach((args) => (0, utilsAndConstants_1.useAssertValueNotChanged)(...args));
        })();
    const abortControllerRef = (0, react_1.useRef)();
    const mutationStateSelector = (0, react_1.useCallback)((state) => {
        cache.options.logsEnabled &&
            (0, utilsAndConstants_1.log)('mutationStateSelector', {
                state,
                cacheState: cache.cacheStateSelector(state),
            });
        return cache.cacheStateSelector(state).mutations[mutationKey];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // @ts-expect-error fix later
    const mutationState = (_b = (0, react_redux_1.useSelector)(mutationStateSelector)) !== null && _b !== void 0 ? _b : utilsAndConstants_1.defaultEndpointState;
    const mutate = (0, react_1.useCallback)((params) => __awaiter(void 0, void 0, void 0, function* () {
        cache.options.logsEnabled &&
            (0, utilsAndConstants_1.log)('mutate', {
                mutationKey,
                params,
                abortController: abortControllerRef.current,
            });
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        else {
            cacheOptions.cacheMutationState &&
                dispatch((0, reducer_1.setMutationStateAndEntities)(mutationKey, { loading: true }));
        }
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        let response;
        let error;
        const fetchFn = cache.mutations[mutationKey].mutation;
        try {
            response = yield fetchFn(
            // @ts-expect-error fix later
            params, abortController.signal);
        }
        catch (e) {
            error = e;
        }
        cache.options.logsEnabled &&
            (0, utilsAndConstants_1.log)('mutate finished', {
                response,
                error,
                aborted: abortController.signal.aborted,
            });
        if (abortController.signal.aborted) {
            return;
        }
        abortControllerRef.current = undefined;
        if (response) {
            dispatch((0, reducer_1.setMutationStateAndEntities)(mutationKey, cacheOptions.cacheMutationState
                ? {
                    error: undefined,
                    loading: false,
                    result: response.result,
                }
                : undefined, cacheOptions.cacheEntities ? response : undefined));
        }
        else if (error && cacheOptions.cacheMutationState) {
            dispatch((0, reducer_1.setMutationStateAndEntities)(mutationKey, {
                error: error,
                loading: false,
            }));
        }
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
    return [mutate, mutationState, abortControllerRef.current];
};
exports.useMutation = useMutation;
