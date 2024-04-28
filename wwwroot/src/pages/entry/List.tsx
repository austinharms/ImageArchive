import { useRef, useState } from "react";
import { ArchiveEntry, EmptyResultArray, ResultArray, getEntries } from "../../ArchiveAPI";
import { EntryList } from "../../components/EntryList";
import PaginatedAsyncLoader, { PaginatedAsyncLoadFunction } from "../../components/PaginatedAsyncLoader";

const loadData = async (callback: (entry: ResultArray<ArchiveEntry>) => void, page: number, pageSize: number) => {
    const results = await getEntries(pageSize, pageSize * (page - 1));
    callback(results);
};

function EntryListPage() {
    const [data, setData] = useState(EmptyResultArray);
    const loadFuncRef = useRef(loadData.bind(undefined, setData) as PaginatedAsyncLoadFunction);
    return (<>
        <h2>All Entries</h2>
        <PaginatedAsyncLoader loadFunction={loadFuncRef.current} totalResultCount={data.totalResultCount} defaultPageSize={25} reloadInterval={30000}>
            <EntryList entries={data.results} />
        </PaginatedAsyncLoader>
    </>);
}

export default EntryListPage;
