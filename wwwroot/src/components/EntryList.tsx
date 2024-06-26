import { ArchiveEntry, getEntryImageURL } from "../ArchiveAPI";
import { Link } from "react-router-dom";
// @ts-ignore: CSS modules don't export as expected, ignore any value does not exist errors
import { itemList, itemContainer } from "./List.module.css";

export interface EntryListProps {
    entries?: Array<ArchiveEntry>
};

export function EntryItem(entry: ArchiveEntry) {
    const imageURL = getEntryImageURL(entry);

    return (<li className={itemContainer} key={entry.id}>
        <Link to={`/entry/view/${entry.id}`}>
            {imageURL ? 
                <img src={imageURL} alt={entry.title} /> :
                <h4>No Image</h4>
            }
            <h3>{entry.title}</h3>
        </Link>
    </li>);
}

export function EntryList({ entries }: EntryListProps) {
    if (!entries || entries.length === 0) {
        return (<h3>No Results</h3>);
    } else {
        return (<ul className={itemList}>{entries.map(EntryItem)}</ul>);
    }
}

export default EntryList;
