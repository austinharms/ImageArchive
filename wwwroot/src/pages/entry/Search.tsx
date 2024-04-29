import { useState } from "react";
import { ArchiveEntry, ArchiveSearchParameters, EmptyResultArray, ResultArray, searchEntries } from "../../ArchiveAPI";
import { EntryList } from "../../components/EntryList";
import PaginatedAsyncLoader, { PaginatedAsyncLoadFunction } from "../../components/PaginatedAsyncLoader";
import SearchForm from "../../components/SearchForm";
import { useSearchParams } from "react-router-dom";

const loadData = async (search: ArchiveSearchParameters, callback: (entry: ResultArray<ArchiveEntry>) => void, page: number, pageSize: number) => {
    const results = await searchEntries(search, pageSize, pageSize * (page - 1));
    callback(results);
};

const urlParamsToSearchParams = (urlParams: URLSearchParams): ArchiveSearchParameters => {
    return {
        title: urlParams.get("title") || "",
        description: urlParams.get("description") || "",
        donor: urlParams.get("donor") || "",
        mediaType: urlParams.get("mediaType") || "",
        collection: urlParams.get("collection") || "",
    };
};

const searchParamsToURLParams = (searchParams: ArchiveSearchParameters, oldURLParams?: URLSearchParams) => {
    const parmsObj: {[key: string]: string} = {};
    if (oldURLParams) {
        oldURLParams.forEach((value, key) => parmsObj[key] = value);
    }

    Object.keys(searchParams).forEach(key => parmsObj[key] = (searchParams as any)[key]);
    return Object.keys(parmsObj).map(key => [key, parmsObj[key]]) as Array<[string, string]>;
};

function SearchEntryPage() {
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState(EmptyResultArray);
    const [loadFunc, setLoadFunc] = useState(() => loadData.bind(undefined, urlParamsToSearchParams(params), setData) as PaginatedAsyncLoadFunction);
    const searchHandler = (search: ArchiveSearchParameters) => {
        setParams(old => {
            old.set("page", "1");
            return searchParamsToURLParams(search, old);
        });
        setLoadFunc(() => loadData.bind(undefined, search, setData) as PaginatedAsyncLoadFunction);
    };

    return (<>
        <h2>Search Archive</h2>
        <SearchForm onSearch={searchHandler} defaultSearch={urlParamsToSearchParams(params)} liveSearchInterval={1000} />
        <h3>Results</h3>
        <PaginatedAsyncLoader loadFunction={loadFunc} totalResultCount={data.totalResultCount} defaultPageSize={25} reloadInterval={30000}>
            <EntryList entries={data.results} />
        </PaginatedAsyncLoader>
    </>);
}

export default SearchEntryPage;
