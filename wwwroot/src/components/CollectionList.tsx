import { ArchiveCollection } from "../ArchiveAPI";
import { Link } from "react-router-dom";

export interface CollectionListProps {
    collections?: Array<ArchiveCollection>
};

export function CollectionItem(collection: ArchiveCollection) {
    return (<li key={collection.id}>
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
