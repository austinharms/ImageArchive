import { useContext, useState, useRef } from 'react';
import EntryForm from '../../components/EntryForm';
import { ArchiveCollection, ArchiveEntryParams, createEntry, EmptyArchiveEntryParams, getCollections } from '../../ArchiveAPI';
import { PromptContext } from '../../main';
import AsyncLoader, { AsyncLoadFunction } from '../../components/AsyncLoader';
import { useNavigate } from 'react-router-dom';

function CreateEntryPage() {
    const navigate = useNavigate();
    const { setPrompt, clearPrompt } = useContext(PromptContext);
    const [collections, setCollections] = useState([] as Array<ArchiveCollection>);
    const loadCollections: AsyncLoadFunction = async () => {
        const arrResults = await getCollections();
        setCollections(arrResults.results);
    };

    const loadFuncRef = useRef(loadCollections);
    const saveHandler = (entry: ArchiveEntryParams) => {
        setPrompt("Saving, Please wait", "CREATE_ENTRY_SAVE");
        createEntry(entry).then((newEntry) => {
            navigate(`/entry/view/${newEntry.id}`);
        }).catch(e => {
            console.error("Failed to save entry:", e);
            alert("Error Saving, Please try again");
        }).then(() => clearPrompt("CREATE_ENTRY_SAVE"));
        console.log("Save:", entry);
    };

    return (<>
        <h2>Create New Entry</h2>
        <AsyncLoader loadFunction={loadFuncRef.current}>
            <EntryForm onSave={saveHandler} collections={collections} defaultEntry={EmptyArchiveEntryParams} />
        </AsyncLoader>
    </>);
}

export default CreateEntryPage;
