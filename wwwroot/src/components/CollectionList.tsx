import { ArchiveCollection } from "../ArchiveAPI";
import { Link } from "react-router-dom";
// @ts-ignore: CSS modules don't export as expected, ignore any value does not exist errors
import { itemContainer } from "./List.module.css";

export interface CollectionListProps {
    collections?: Array<ArchiveCollection>
};

export function CollectionItem(collection: ArchiveCollection) {
    return (<li className={itemContainer} key={collection.id}>
        <Link to={`/collection/view/${collection.id}`}>
            <h3>{collection.name}</h3>
        </Link>
    </li>);
};

export function CollectionList({ collections }: CollectionListProps) {
    if (!collections || collections.length === 0) {
        return (<h3>No Results</h3>);
    } else {
        return (<ul>{collections.map(CollectionItem)}</ul>);
    }
};

export default CollectionList;
