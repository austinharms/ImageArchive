import { useId, ChangeEvent, SyntheticEvent, useEffect, useState, useRef } from "react";
// @ts-ignore: CSS modules don't export as expected, ignore any value does not exist errors
import { searchGrid, searchInputWrapper } from "./Form.module.css";
import { ArchiveSearchParameters } from "../ArchiveAPI";
export interface SearchFormProps {
    onSearch: (params: ArchiveSearchParameters) => void,
    defaultSearch: ArchiveSearchParameters,
    liveSearchInterval?: number, 
};

function SearchForm({ defaultSearch, onSearch, liveSearchInterval }: SearchFormProps) {
    const titleId = useId();
    const descriptionId = useId();
    const donorId = useId();
    const mediaTypeId = useId();
    const collectionId = useId();
    const liveSearchTimeoutRef = useRef(undefined as undefined | number);
    const [search, setSearch] = useState({ ...defaultSearch });
    useEffect(() => (() => clearTimeout(liveSearchTimeoutRef.current)), []);
    const searchSubmitHandler = (e: SyntheticEvent) => {
        clearTimeout(liveSearchTimeoutRef.current);
        liveSearchTimeoutRef.current = undefined;
        e.preventDefault();
        onSearch(search);
    };

    const inputChangeHandler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        clearTimeout(liveSearchTimeoutRef.current);
        liveSearchTimeoutRef.current = undefined;
        setSearch(old => {
            const newState = {...old, [e.target.name]: e.target.value };
            if (liveSearchInterval && liveSearchInterval > 0) {
                liveSearchTimeoutRef.current = setTimeout(onSearch.bind(undefined, newState), liveSearchInterval) as any as number;
            }

            return newState;
        });
    };

    return (<form onSubmit={searchSubmitHandler}>
        <div className={searchGrid}>
            <div className={searchInputWrapper}>
                <label htmlFor={titleId}>Title</label>
                <input id={titleId} type="text" name="title" value={search.title} placeholder="Title..." onChange={inputChangeHandler} />
            </div>
            <div className={searchInputWrapper}>
                <label htmlFor={descriptionId}>Description</label>
                <input id={descriptionId} type="text" name="description" value={search.description} placeholder="Description..." onChange={inputChangeHandler} />
            </div>
            <div className={searchInputWrapper}>
                <label htmlFor={donorId}>Donor</label>
                <input id={donorId} type="text" name="donor" value={search.donor} placeholder="Donor..." onChange={inputChangeHandler} />
            </div>
            <div className={searchInputWrapper}>
                <label htmlFor={mediaTypeId}>Media Type</label>
                <input id={mediaTypeId} type="text" name="mediaType" value={search.mediaType} placeholder="Media Type..." onChange={inputChangeHandler} />
            </div>
            <div className={searchInputWrapper}>
                <label htmlFor={collectionId}>Collection</label>
                <input id={collectionId} type="text" name="collection" value={search.collection} placeholder="Collection..." onChange={inputChangeHandler} />
            </div>
            <div className={searchInputWrapper}>
                <div></div>
                <button>Search</button>
            </div>
        </div>
    </form>);
}

export default SearchForm;