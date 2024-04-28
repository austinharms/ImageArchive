import React, { useEffect, useRef, useState } from "react";

export type AsyncLoadFunction = () => Promise<void>;

export interface AsyncLoaderProps {
    children?: React.ReactNode,
    loadFunction: AsyncLoadFunction,
    reloadInterval?: number
}

enum LoadState {
    PENDING = 0,
    COMPLETED,
    ERROR,
}

interface RequestState {
    requestPending: boolean,
    pendingTimeout?: number
}

export function AsyncLoader({ loadFunction, reloadInterval, children }: AsyncLoaderProps) {
    const requestRef = useRef({ requestPending: false } as RequestState);
    const lastLoadFunc = useRef(loadFunction);
    const [loadState, setLoadState] = useState(LoadState.PENDING);
    const executeLoadFunction = async () => {
        try {
            if (requestRef.current.requestPending) return;
            requestRef.current.requestPending = true;
            clearTimeout(requestRef.current.pendingTimeout);
            requestRef.current.pendingTimeout = undefined;
            await loadFunction();
            if (reloadInterval && reloadInterval > 0) {
                requestRef.current.pendingTimeout = setTimeout(executeLoadFunction, reloadInterval) as any as number;
            }

            setLoadState(LoadState.COMPLETED);
        } catch (e) {
            console.error(e);
            if (loadState === LoadState.PENDING) {
                setLoadState(LoadState.ERROR);
            }
        }

        requestRef.current.requestPending = false;
    };

    useEffect(() => {
        if (lastLoadFunc.current !== loadFunction) {
            lastLoadFunc.current = loadFunction;
            setLoadState(LoadState.PENDING);
        }

        executeLoadFunction();
        return (() => clearTimeout(requestRef.current.pendingTimeout));
    }, [loadFunction, reloadInterval]);

    switch (loadState) {
        case LoadState.PENDING:
            return (<h3>Loading...</h3>);
        case LoadState.ERROR:
            return (<h3>Error Loading Data</h3>);
        case LoadState.COMPLETED:
            return (<>{children}</>);
    }
}

export default AsyncLoader;