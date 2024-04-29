import { useContext, useState, useRef } from 'react';
import EntryForm from '../../components/EntryForm';
import { ArchiveCollection, ArchiveCollectionId, ArchiveEntry, ArchiveEntryParams, deleteEntry, editEntry, EmptyArchiveEntryParams, getCollections, getEntry, getEntryImageURL } from '../../ArchiveAPI';
import { PromptContext } from '../../main';
import AsyncLoader from '../../components/AsyncLoader';
import { useNavigate, useParams } from 'react-router-dom';

const entryToParams = (entry: ArchiveEntry | null): ArchiveEntryParams => {
    const params: ArchiveEntryParams = {
        ...EmptyArchiveEntryParams
    };

    if (entry) {
        params.collectionId = entry.collectionId;
        params.colour = entry.colour;
        params.description = entry.description;
        params.donor = entry.donor;
        params.mediaType = entry.mediaType;
        params.physicalLocation = entry.physicalLocation;
        params.size = entry.size;
        params.title = entry.title;
        params.yearCreated = entry.yearCreated;
        params.accessionNumber = entry.accessionNumber,
        params.image = undefined;
    }

    return params;
};

const loadEntry = async (id: string | undefined, callback: (entry: ArchiveEntry) => void) => {
    const idNo: number = parseInt(id || "");
    if (!isFinite(idNo)) throw new Error("Bad ID");
    const results = await getEntry(idNo);
    callback(results);
};

const loadCollections = async (callback: (entry: Array<ArchiveCollection>) => void) => {
    const arrResults = await getCollections();
    callback(arrResults.results);
};

function EditEntryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPrompt, clearPrompt } = useContext(PromptContext);
    const [collections, setCollections] = useState([] as Array<ArchiveCollection>);
    const [entry, setEntry] = useState(null as null | ArchiveEntry);
    const loadCollectionsRef = useRef(loadCollections.bind(undefined, setCollections));
    const loadEntryRef = useRef(loadEntry.bind(undefined, id, setEntry));
    const saveHandler = (updatedEntry: ArchiveEntryParams) => {
        setPrompt("Saving, Please wait", "EDIT_ENTRY_SAVE");
        editEntry(entry!.id, updatedEntry).then((newEntry) => {
            navigate(`/entry/view/${newEntry.id}`);
        }).catch(e => {
            console.error("Failed to save entry:", e);
            alert("Error Saving, Please try again");
        }).then(() => clearPrompt("EDIT_ENTRY_SAVE"));
    };

    const deleteHandler = () => {
        if (confirm(`Are you sure you want to delete "${entry?.title}"`)) {
            setPrompt("Deleting, Please wait", "EDIT_ENTRY_DELETE");
            deleteEntry(entry!.id).then(() => {
                navigate(`/entry/list`);
            }).catch(e => {
                console.error("Failed to delete entry:", e);
                alert("Error Deleting, Please try again");
            }).then(() => clearPrompt("EDIT_ENTRY_DELETE"));
        }
    };

    const addCollection = (collection: ArchiveCollection) => {
        setCollections((old) => {
            // Filter possible duplicate ids
            const allCollections: {[key: ArchiveCollectionId]: ArchiveCollection} = {
                [collection.id]: collection
            };

            old.forEach(c => allCollections[c.id] = c);
            return Object.values(allCollections);
        });
    };


    return (<>
        <h2>Edit Entry</h2>
        <AsyncLoader loadFunction={loadEntryRef.current}>
            <AsyncLoader loadFunction={loadCollectionsRef.current} reloadInterval={30000}>
                <EntryForm onDelete={deleteHandler} onCancel={() => navigate(`/entry/view/${entry?.id}`)} onSave={saveHandler} collections={collections} defaultEntry={entryToParams(entry)} defaultImage={getEntryImageURL(entry)} addCollection={addCollection} />
            </AsyncLoader>
        </AsyncLoader>
    </>);
}

export default EditEntryPage;
