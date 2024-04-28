import { useContext, useRef, useState } from 'react';
import { ArchiveCollectionParams, ArchiveCollection, editCollection, getCollection, deleteCollection, DefaultArchiveCollectionId } from '../../ArchiveAPI';
import { PromptContext } from '../../main';
import { useNavigate, useParams } from 'react-router-dom';
import CollectionForm from '../../components/CollectionForm';
import AsyncLoader from '../../components/AsyncLoader';

const collectionToParams = (collection: ArchiveCollection): ArchiveCollectionParams => {
    return { name: collection.name };
};

const loadCollection = async (id: string | undefined, callback: (collection: ArchiveCollection) => void) => {
    const idNo: number = parseInt(id || "");
    if (!isFinite(idNo)) throw new Error("Bad ID");
    const results = await getCollection(idNo);
    callback(results);
};

function EditCollectionPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setPrompt, clearPrompt } = useContext(PromptContext);
    const [collection, setCollection] = useState(null as ArchiveCollection | null);
    const loadCollectionRef = useRef(loadCollection.bind(undefined, id, setCollection));
    const saveHandler = (updatedCollection: ArchiveCollectionParams) => {
        setPrompt("Saving, Please wait", "EDIT_COLLECTION_SAVE");
        editCollection(collection!.id, updatedCollection).then((newCollection) => {
            navigate(`/collection/view/${newCollection.id}`);
        }).catch(e => {
            console.error("Failed to save collection:", e);
            alert("Error Saving, Please try again");
        }).then(() => clearPrompt("EDIT_COLLECTION_SAVE"));
    };

    const deleteHandler = () => {
        if (confirm(`Are you sure you want to delete "${collection?.name}"`)) {
            setPrompt("Deleting, Please wait", "EDIT_COLLECTION_DELETE");
            deleteCollection(collection!.id).then(() => {
                navigate(`/collection/list`);
            }).catch(e => {
                console.error("Failed to delete collection:", e);
                alert("Error Deleting, Please try again");
            }).then(() => clearPrompt("EDIT_COLLECTION_DELETE"));
        }
    };

    if (collection?.id === DefaultArchiveCollectionId) {
        return (<>
            <h2>Edit Collection</h2>
            <h3>The Default Collection Can Not Be Edited</h3>
        </>)
    }

    return (<>
        <h2>Edit Collection</h2>
        <AsyncLoader loadFunction={loadCollectionRef.current}>
            {collection && <CollectionForm defaultCollection={collectionToParams(collection)} onSave={saveHandler} onDelete={deleteHandler} onCancel={() => navigate(`/collection/view/${collection.id}`)} />}
        </AsyncLoader>
    </>);
}

export default EditCollectionPage;
