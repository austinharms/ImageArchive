import { useContext, useState, useRef } from 'react';
import { ArchiveCollection, ArchiveEntry, ArchiveEntryParams, createEntry, EmptyArchiveEntryParams, getCollections, getEntry } from '../../ArchiveAPI';
import AsyncLoader, { AsyncLoadFunction } from '../../components/AsyncLoader';
import { Link, useParams } from "react-router-dom";
import EntryDetails from '../../components/EntryDetails';

const loadEntry = async (id: string | undefined, callback: (entry: ArchiveEntry) => void) => {
    const idNo: number = parseInt(id || "");
    if (!isFinite(idNo)) throw new Error("Bad ID");
    const results = await getEntry(idNo);
    callback(results);
};

function ViewEntryPage() {
    const { id } = useParams();
    const [entry, setEntry] = useState(null as null | ArchiveEntry);
    const loadFuncRef = useRef(loadEntry.bind(undefined, id, setEntry));
    return (<AsyncLoader loadFunction={loadFuncRef.current}>
            {entry && <EntryDetails entry={entry} />}
        </AsyncLoader>);
}

export default ViewEntryPage;
