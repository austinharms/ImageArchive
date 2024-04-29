import { FormEvent, useState, FormEventHandler, useId, ChangeEvent } from "react";
import { ArchiveCollection, ArchiveEntryParams, DefaultArchiveCollectionId } from "../ArchiveAPI";
import ImageUploadWidget from "./ImageInput";
import Popup from "./Popup";
import CreateCollection, { CreateCollectionProps } from "./CreateCollection";
// @ts-ignore: CSS modules don't export as expected, ignore any value does not exist errors
import { inputGrid, buttonWrapper, descriptionInput, inputWrapper, collectionPopup } from "./Form.module.css";
export interface EditEntryFormProps {
    collections: Readonly<Array<ArchiveCollection>>,
    onSave: (entry: ArchiveEntryParams) => void,
    defaultEntry: ArchiveEntryParams,
    addCollection: (collection: ArchiveCollection) => void,
    defaultImage?: string | File,
    onDelete?: () => void,
    onCancel?: () => void,
};

function CreateCollectionPopup({ onCreate, onCancel }: CreateCollectionProps) {
    return <Popup>
        <div className={collectionPopup}>
            <CreateCollection onCreate={onCreate} onCancel={onCancel} />
        </div>
    </Popup>
}

function EntryForm({ collections, onSave, defaultEntry, defaultImage, onDelete, onCancel, addCollection }: EditEntryFormProps) {
    const titleId = useId();
    const descriptionId = useId();
    const donorId = useId();
    const yearCreatedId = useId();
    const colourId = useId();
    const sizeId = useId();
    const physicalLocationId = useId();
    const mediaTypeId = useId();
    const collectionIdId = useId();
    const [entry, setEntry] = useState({ ...defaultEntry });
    const [collectionFormOpen, setCollectionFormOpen] = useState(false);

    const inputChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEntry((old) => ({ ...old, [e.target.name]: e.target.value }));
    };

    const collectionChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === "-1") {
            setCollectionFormOpen(true);
        } else {
            setEntry((old) => ({ ...old, collectionId: parseInt(e.target.value) }));
        }
    };

    const fileChangeHandler = (file: File | null) => {
        setEntry((old) => ({ ...old, image: file || undefined }));
    };

    const submitHandler: FormEventHandler<HTMLFormElement> = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave({ ...entry, collectionId: entry.collectionId == -1 ? DefaultArchiveCollectionId : entry.collectionId });
    };

    const createCollectionHandler = (collection: ArchiveCollection) => {
        addCollection(collection);
        setEntry((old) => ({ ...old, collectionId: collection.id }));
        setCollectionFormOpen(false);
    };

    if (!collections.map(c => c.id).includes(entry.collectionId)) {
        setEntry((old) => ({ ...old, collectionId: DefaultArchiveCollectionId }));
    }

    return (<div>
        {collectionFormOpen && <CreateCollectionPopup onCreate={createCollectionHandler} onCancel={() => setCollectionFormOpen(false)} /> }
        <ImageUploadWidget defaultValue={defaultImage} onChange={fileChangeHandler} />
        <form onSubmit={submitHandler}>
            <div className={inputWrapper}>
                <label htmlFor={titleId}>Title</label>
                <input id={titleId} type="text" name="title" value={entry.title} placeholder="Title..." required minLength={1} onChange={inputChangeHandler} />
            </div>
            <div className={inputWrapper}>
                <label htmlFor={descriptionId}>Description</label>
                <textarea className={descriptionInput} id={descriptionId} name="description" value={entry.description} placeholder="Description..." required minLength={1} onChange={inputChangeHandler}></textarea>
            </div>
            <div className={inputGrid}>
                <div className={inputWrapper}>
                    <label htmlFor={donorId}>Donor</label>
                    <input id={donorId} type="text" name="donor" value={entry.donor} placeholder="Donor..." onChange={inputChangeHandler} />
                </div>
                <div className={inputWrapper}>
                    <label htmlFor={yearCreatedId}>Year Taken</label>
                    <input id={yearCreatedId} type="text" name="yearCreated" value={entry.yearCreated} placeholder="Year Taken..." onChange={inputChangeHandler} />
                </div>
                <div className={inputWrapper}>
                    <label htmlFor={colourId}>Colour</label>
                    <input id={colourId} type="text" name="colour" value={entry.colour} placeholder="Colour..." onChange={inputChangeHandler} />
                </div>
                <div className={inputWrapper}>
                    <label htmlFor={sizeId}>Size</label>
                    <input id={sizeId} type="text" name="size" value={entry.size} placeholder="Size..." onChange={inputChangeHandler} />
                </div>
                <div className={inputWrapper}>
                    <label htmlFor={physicalLocationId}>Location</label>
                    <input id={physicalLocationId} type="text" name="physicalLocation" value={entry.physicalLocation} placeholder="Location..." onChange={inputChangeHandler} />
                </div>
                <div className={inputWrapper}>
                    <label htmlFor={mediaTypeId}>Media Type</label>
                    <input id={mediaTypeId} type="text" name="mediaType" value={entry.mediaType} placeholder="Media Type..." onChange={inputChangeHandler} />
                </div>
                <div className={inputWrapper}>
                    <label htmlFor={collectionIdId}>Collection</label>
                    <select id={collectionIdId} name="collectionId" value={entry.collectionId} disabled={collections.length === 0} onChange={collectionChangeHandler}>
                        <option value={-1}>CREATE COLLECTION</option>
                        {collections.map(c => (<option key={c.id} value={c.id} >{c.name}</option>))}
                    </select>
                </div>
            </div>
            <div className={buttonWrapper}>
                {onCancel && <button onClick={e => { e.preventDefault(), onCancel(); }}>Cancel</button>}
                <button>Save</button>
                {onDelete && <button onClick={e => { e.preventDefault(), onDelete(); }}>Delete</button>}
            </div>
        </form>
    </div>);
}

export default EntryForm;
