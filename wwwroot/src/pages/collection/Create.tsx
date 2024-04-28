import { useNavigate } from 'react-router-dom';
import CreateCollection from '../../components/CreateCollection';
import { ArchiveCollection } from '../../ArchiveAPI';

function CreateCollectionPage() {
    const navigate = useNavigate();
    const createHandler = (collection: ArchiveCollection) => {
        navigate(`/collection/view/${collection.id}`);
    };

    return (<CreateCollection onCreate={createHandler} />);
}

export default CreateCollectionPage;
