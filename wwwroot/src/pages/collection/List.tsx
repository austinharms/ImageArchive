import { useRef, useState } from "react";
import PaginatedAsyncLoader from "../../components/PaginatedAsyncLoader";
import { ArchiveCollection, EmptyResultArray, ResultArray, getCollections } from "../../ArchiveAPI";
import CollectionList from "../../components/CollectionList";

const loadData = async (callback: (entry: ResultArray<ArchiveCollection>) => void, page: number,  pageSize: number) => {
    const results = await getCollections(pageSize, pageSize * (page - 1));
    callback(results);
};

function ListCollectionPage() {
    const [data, setData] = useState(EmptyResultArray);
    const loadFuncRef = useRef(loadData.bind(undefined, setData));

    return (<>
        <h2>All Collections</h2>
        <PaginatedAsyncLoader loadFunction={loadFuncRef.current} totalResultCount={data.totalResultCount} defaultPageSize={25} reloadInterval={30000}>
            <CollectionList collections={data.results} />
        </PaginatedAsyncLoader>
    </>);
}

export default ListCollectionPage;
