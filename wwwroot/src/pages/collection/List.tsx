import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AsyncLoader, { AsyncLoadFunction } from "../../components/AsyncLoader";
import PageControls from "../../components/PageControls";
import { ArchiveCollection, EmptyResultArray, ResultArray, getCollections } from "../../ArchiveAPI";
import CollectionList from "../../components/CollectionList";

const loadData = async (pageSize: number, page: number, callback: (entry: ResultArray<ArchiveCollection>) => void) => {
    const results = await getCollections(pageSize, pageSize * (page - 1));
    callback(results);
};

function CollectionListPage() {
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
        <h2>All Collections</h2>
        <AsyncLoader loadFunction={loadFunc}>
            <CollectionList collections={data.results} />
            <PageControls page={pageNumber} pageCount={ Math.max(Math.ceil(data.totalResultCount / pageSize), 1)} setPage={setPage} />
        </AsyncLoader>
    </>);
}

export default CollectionListPage;
