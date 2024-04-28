import { FormEvent, ChangeEvent, useState, useId } from "react";
import { ArchiveCollectionParams } from "../ArchiveAPI";
import { buttonWrapper, inlineInputWrapper } from "./Form.module.css";
export interface CollectionFormProps {
    defaultCollection: ArchiveCollectionParams
    onSave: (collection: ArchiveCollectionParams) => void,
    onDelete?: () => void;
    onCancel?: () => void;
};

function CollectionForm({ defaultCollection, onSave, onDelete, onCancel }: CollectionFormProps) {
    const nameId = useId();
    const [collection, setCollection] = useState({ ...defaultCollection });
    const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setCollection((old) => ({ ...old, [e.target.name]: e.target.value }));
    };
    const submitHandler = (e: FormEvent) => {
        e.preventDefault();
        onSave(collection);
    };

    return (<form onSubmit={submitHandler}>
        <div className={inlineInputWrapper}>
            <label htmlFor={nameId}>Name</label>
            <input id={nameId} type="text" name="name" value={collection.name} placeholder="Name..." required minLength={1} onChange={inputChangeHandler} />
        </div>
        <div className={buttonWrapper}>
            {onCancel && <button onClick={e => { e.preventDefault(), onCancel(); }}>Cancel</button>}
            <button>Save</button>
            {onDelete && <button onClick={e => { e.preventDefault(), onDelete(); }}>Delete</button>}
        </div>
    </form>);
}

export default CollectionForm;
