import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AsyncLoader from "./AsyncLoader";

// Page number starts a 1
export type PaginatedAsyncLoadFunction = (page: number, pageSize: number) => Promise<void>;
export interface PaginatedAsyncLoaderProps {
    children?: React.ReactNode,
    loadFunction: PaginatedAsyncLoadFunction,
    reloadInterval?: number,
    totalResultCount: number,
    defaultPageSize: number
};

function PaginatedAsyncLoader({ children, loadFunction, reloadInterval, totalResultCount, defaultPageSize }: PaginatedAsyncLoaderProps) {
    const [searchParams, setSearchParams] = useSearchParams([["page", "1"], ["page_size", `${defaultPageSize}`]]);
    const pageNumber: number = Math.max(parseInt(searchParams.get("page")!), 0) || 1;
    const pageSize: number = Math.max(parseInt(searchParams.get("page_size")!), 0) || defaultPageSize;
    const pageCount: number = Math.ceil(totalResultCount / pageSize) || 1;
    const [boundLoadFunction, setBoundLoadFunction] = useState(() => loadFunction.bind(undefined, pageNumber, pageSize));
    const setPage = (page: number) => setSearchParams([["page", `${page}`], ["page_size", `${pageSize}`]]);
    useEffect(() => {
        setBoundLoadFunction(() => loadFunction.bind(undefined, pageNumber, pageSize));
    }, [loadFunction, pageNumber, pageSize]);

    return (<AsyncLoader loadFunction={boundLoadFunction} reloadInterval={reloadInterval}>
        {children}
        <div>
            <button disabled={pageNumber <= 1} onClick={e => { e.preventDefault(); setPage(pageNumber - 1); }}>Back</button>
            {` Page: ${pageNumber} of ${pageCount} `}
            <button disabled={pageNumber >= pageCount} onClick={e => { e.preventDefault(); setPage(pageNumber + 1); }}>Next</button>
        </div>
    </AsyncLoader>);
}

export default PaginatedAsyncLoader;
