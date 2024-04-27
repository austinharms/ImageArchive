import { FormEvent, useState, FormEventHandler, ChangeEventHandler, useId } from "react";
import { ArchiveCollection, ArchiveEntryParams, DefaultArchiveCollectionId } from "../ArchiveAPI";
import ImageUploadWidget from "./ImageInput";
import { inputGrid, buttonWrapper, descriptionInput, inputWrapper } from "./EntryForm.module.css";

export interface EditEntryFormProps {
    collections: Readonly<Array<ArchiveCollection>>,
    onSave: (entry: ArchiveEntryParams) => void,
    defaultEntry: ArchiveEntryParams,
    defaultImage?: string | File,
    onDelete?: () => void;
    onCancel?: () => void;
};

// const entryToParams = (entry: ArchiveEntry | null): ArchiveEntryParams => {
//     const params: ArchiveEntryParams = { 
//         ...EmptyArchiveEntryParams
//     };

//     if (entry) {
//         params.collectionId = entry.collectionId;
//         params.colour = entry.colour;
//         params.description = entry.description;
//         params.donor = entry.donor;
//         params.mediaType = entry.mediaType;
//         params.physicalLocation = entry.physicalLocation;
//         params.size = entry.size;
//         params.title = entry.title;
//         params.yearCreated = entry.yearCreated;
//         params.image = undefined;
//     }

//     return params;
// };

function EntryForm({ collections, onSave, defaultEntry, defaultImage, onDelete, onCancel }: EditEntryFormProps) {
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

    const inputChangeHandler: ChangeEventHandler<any> = (e) => {
        setEntry((old) => ({ ...old, [e.target.name]: e.target.value }));
    };

    const fileChangeHandler = (file: File | null) => {
        setEntry((old) => ({ ...old, image: file || undefined }));
    };

    const submitHandler: FormEventHandler<HTMLFormElement> = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave({ ...entry, collectionId: entry.collectionId == -1 ? DefaultArchiveCollectionId : entry.collectionId });
    };

    const selectedCollectionId = collections.map(c => c.id).includes(entry.collectionId) ? entry.collectionId : DefaultArchiveCollectionId;

    return (<div>
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
                    <select id={collectionIdId} name="collectionId" value={selectedCollectionId} disabled={collections.length === 0} onChange={inputChangeHandler}>
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
