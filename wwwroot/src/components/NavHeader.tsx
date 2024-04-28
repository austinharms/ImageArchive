import { Link } from "react-router-dom";
import { splitContents, navList, navItem, navWrapper } from "./NavHeader.module.css";
import { contentWrapper } from "../main.module.css";

function NavHeader() {
    return (<div className={navWrapper}>
        <nav className={`${splitContents} ${contentWrapper}`}>
            <Link className={navItem} to="/entry/list">
                <h1>Altona Archive</h1>
            </Link>
            <ul className={navList}>
                <li><Link className={navItem} to="/entry/list">Entries</Link></li>
                <li><Link className={navItem} to="/entry/create">Create Entry</Link></li>
                <li><Link className={navItem} to="/collection/list">Collections</Link></li>
                <li><Link className={navItem} to="/collection/create">Create Collection</Link></li>
            </ul>
        </nav>
    </div>);
}

export default NavHeader;