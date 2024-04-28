import { useNavigate } from "react-router-dom";
import { ArchiveEntry, getEntryImageURL } from "../ArchiveAPI";
import { detailsGrid, detailItem, image, editButton } from "./Details.module.css";
export interface ViewEntryProps {
    entry: ArchiveEntry
};

function EntryDetails({ entry }: ViewEntryProps) {
    const navigate = useNavigate();
    const imageURL = getEntryImageURL(entry);
    const openImageTab = (e: React.SyntheticEvent) => {
        e.preventDefault();
        window.open(imageURL, "_blank")?.focus();
    };

    return (<div>
        {imageURL ?
            <img className={image} src={imageURL} onClick={openImageTab} /> :
            <h3>No Image</h3>
        }
        <h3>{entry.title}</h3>
        <p>{entry.description}</p>
        <div className={detailsGrid}>
            <div className={detailItem}>
                <h4>Donor:</h4>
                <p>{entry.donor}</p>
            </div>
            <div className={detailItem}>
                <h4>Year Taken:</h4>
                <p>{entry.yearCreated}</p>
            </div>
            <div className={detailItem}>
                <h4>Colour:</h4>
                <p>{entry.colour}</p>
            </div>
            <div className={detailItem}>
                <h4>Size:</h4>
                <p>{entry.size}</p>
            </div>
            <div className={detailItem}>
                <h4>Location:</h4>
                <p>{entry.physicalLocation}</p>
            </div>
            <div className={detailItem}>
                <h4>Media Type:</h4>
                <p>{entry.mediaType}</p>
            </div>
            <div className={detailItem}>
                <h4>Collection:</h4>
                <p>{entry.collection.name}</p>
            </div>
            <div className={detailItem}>
                <h4>Date Added:</h4>
                <p>{new Date(entry.dateAdded).toLocaleDateString()}</p>
            </div>
            <div className={detailItem}>
                <h4>Date Last Updated:</h4>
                <p>{new Date(entry.dateLastModified).toLocaleDateString()}</p>
            </div>
            <div className={detailItem}>
                <button className={editButton} onClick={() => navigate(`/entry/edit/${entry.id}`)}>Edit Entry</button>
            </div>
        </div>
    </div>);
}

export default EntryDetails;
