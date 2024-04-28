import { useNavigate } from "react-router-dom";
import { ArchiveCollection } from "../ArchiveAPI";
import { detailsGrid, detailItem, editButton } from "./Details.module.css";
export interface ViewCollectionProps {
    collection: ArchiveCollection
};

function CollectionDetails({ collection }: ViewCollectionProps) {
    const navigate = useNavigate();
    return (<div>
        <h3>Name: {collection.name}</h3>
        <div className={detailsGrid}>
            <div className={detailItem}>
                <h4>Date Created:</h4>
                <p>{new Date(collection.dateCreated).toLocaleDateString()}</p>
            </div>
            <div className={detailItem}>
                <button className={editButton} onClick={() => navigate(`/collection/edit/${collection.id}`)}>Edit Collection</button>
            </div>
        </div>
    </div>);
}

export default CollectionDetails;
