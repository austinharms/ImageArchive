import { useState, useRef } from 'react';
import { ArchiveCollection, ArchiveEntry, EmptyResultArray, ResultArray, getCollection, getEntriesByCollection } from '../../ArchiveAPI';
import AsyncLoader from '../../components/AsyncLoader';
import { useParams } from "react-router-dom";
import CollectionDetails from '../../components/CollectionDetails';
import PaginatedAsyncLoader from '../../components/PaginatedAsyncLoader';
import EntryList from '../../components/EntryList';

const loadCollection = async (id: string | undefined, callback: (collection: ArchiveCollection) => void) => {
    const idNo: number = parseInt(id || "");
    if (!isFinite(idNo)) throw new Error("Bad ID");
    const results = await getCollection(idNo);
    callback(results);
};

const loadEntries = async (id: string | undefined, callback: (entry: ResultArray<ArchiveEntry>) => void, page: number, pageSize: number) => {
    const idNo: number = parseInt(id || "");
    if (!isFinite(idNo)) throw new Error("Bad ID");
    const results = await getEntriesByCollection(idNo, pageSize, pageSize * (page - 1));
    callback(results);
};

function ViewCollectionPage() {
    const { id } = useParams();
    const [collection, setCollection] = useState(null as null | ArchiveCollection);
    const [entries, setEntries] = useState(EmptyResultArray);
    const loadCollectionRef = useRef(loadCollection.bind(undefined, id, setCollection));
    const loadEntriesRef = useRef(loadEntries.bind(undefined, id, setEntries));

    return (<>
    <h2>Collection Details</h2>
        <AsyncLoader loadFunction={loadCollectionRef.current} reloadInterval={30000}>
            {collection && <CollectionDetails collection={collection} />}
        </AsyncLoader>
        <h3>Collection Entries</h3>
        <PaginatedAsyncLoader loadFunction={loadEntriesRef.current} totalResultCount={entries.totalResultCount} defaultPageSize={25} reloadInterval={30000}>
            <EntryList entries={entries.results} />
        </PaginatedAsyncLoader>
    </>);
}

export default ViewCollectionPage;
