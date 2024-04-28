import { useContext } from 'react';
import { createCollection, ArchiveCollectionParams, EmptyArchiveCollectionParams } from '../ArchiveAPI';
import { PromptContext } from '../main';
import CollectionForm from './CollectionForm';
import { ArchiveCollection } from '../ArchiveAPI';

export interface CreateCollectionProps {
    onCreate: (collection: ArchiveCollection) => void;
    onCancel?: () => void,
};

function CreateCollection({ onCreate, onCancel }: CreateCollectionProps) {
    const { setPrompt, clearPrompt } = useContext(PromptContext);
    const saveHandler = (collection: ArchiveCollectionParams) => {
        setPrompt("Saving, Please wait", "CREATE_COLLECTION_SAVE");
        createCollection(collection).then(onCreate).catch(e => {
            console.error("Failed to save collection:", e);
            alert("Error Saving, Please try again");
        }).then(() => clearPrompt("CREATE_COLLECTION_SAVE"));
    };

    return (<>
        <h2>Create New Collection</h2>
        <CollectionForm defaultCollection={EmptyArchiveCollectionParams} onSave={saveHandler} onCancel={onCancel} />
    </>);
}

export default CreateCollection;
