import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AsyncLoader, { AsyncLoadFunction } from "../../components/AsyncLoader";
import PageControls from "../../components/PageControls";
import { ArchiveEntry, EmptyResultArray, ResultArray, getEntries } from "../../ArchiveAPI";
import { EntryList } from "../../components/EntryList";

const loadData = async (pageSize: number, page: number, callback: (entry: ResultArray<ArchiveEntry>) => void) => {
    const results = await getEntries(pageSize, pageSize * (page - 1));
    callback(results);
};

function EntryListPage() {
    const [data, setData] = useState(EmptyResultArray);
    const [searchParams, setSearchParams] = useSearchParams([["page", "1"], ["page_size", "25"]]);
    const pageNumber: number = Math.max(parseInt(searchParams.get("page")!), 0) || 1;
    const pageSize: number = Math.max(parseInt(searchParams.get("page_size")!), 0) || 25;

    const [loadFunc, setLoadFunc] = useState(() => loadData.bind(undefined, pageSize, pageNumber, setData) as AsyncLoadFunction);
    const setPage = (page: number) => {
        setSearchParams([["page", `${page}`], ["page_size", `${pageSize}`]]);
        setLoadFunc(() => loadData.bind(undefined, pageSize, page, setData) as AsyncLoadFunction);
    };

    return (<>
        <h2>All Entries</h2>
        <AsyncLoader loadFunction={loadFunc}>
            <EntryList entries={data.results} />
            <PageControls page={pageNumber} pageCount={ Math.max(Math.ceil(data.totalResultCount / pageSize), 1)} setPage={setPage} />
        </AsyncLoader>
    </>);
}

export default EntryListPage;
