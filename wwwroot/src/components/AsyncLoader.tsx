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

export function AsyncLoader({ loadFunction, reloadInterval, children }: AsyncLoaderProps) {
    const timeoutRef = useRef(undefined as undefined | number);
    const lastLoadFunc = useRef(null as AsyncLoadFunction | null);
    const [loadState, setLoadState] = useState(LoadState.PENDING);
    const executeLoadFunction = async () => {
        try {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
            await loadFunction();
            if (reloadInterval && reloadInterval > 0) {
                timeoutRef.current = setTimeout(executeLoadFunction, reloadInterval) as any as number;
            }

            setLoadState(LoadState.COMPLETED);
        } catch (e) {
            console.error(e);
            if (loadState === LoadState.PENDING) {
                setLoadState(LoadState.ERROR);
            }
        }
    };

    useEffect(() => {
        if (lastLoadFunc.current !== loadFunction) {
            lastLoadFunc.current = loadFunction;
            setLoadState(LoadState.PENDING);
        }

        executeLoadFunction();
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