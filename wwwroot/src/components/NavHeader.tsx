import { Link } from "react-router-dom";
// @ts-ignore: CSS modules don't export as expected, ignore any value does not exist errors
import { splitContents, navList, navItem, navWrapper, navSection } from "./NavHeader.module.css";
// @ts-ignore: CSS modules don't export as expected, ignore any value does not exist errors
import { contentWrapper } from "../main.module.css";

function NavHeader() {
    return (<div className={navWrapper}>
        <nav className={`${splitContents} ${contentWrapper}`}>
            <Link className={navItem} to="/entry/search">
                <h1>Altona Archive</h1>
            </Link>
            <ul className={navList}>
                <div className={navSection}>
                    <li><Link className={navItem} to="/entry/search">Search</Link></li>
                    <li><Link className={navItem} to="/entry/list">Entries</Link></li>
                    <li><Link className={navItem} to="/entry/create">Create Entry</Link></li>
                </div>
                <div className={navSection}>
                    <li><Link className={navItem} to="/collection/list">Collections</Link></li>
                    <li><Link className={navItem} to="/collection/create">Create Collection</Link></li>
                </div>
            </ul>
        </nav>
    </div>);
}

export default NavHeader;