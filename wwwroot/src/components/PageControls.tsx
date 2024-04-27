export type SetPageFunc = (page: number) => void;
export interface ListPageControlsProps {
    page: number,
    pageCount: number,
    setPage: SetPageFunc
};

function PageControls({ page, pageCount, setPage }: ListPageControlsProps) {
    return (<div>
        <button disabled={page <= 1} onClick={e => { e.preventDefault(); setPage(page - 1); }}>Back</button>
        {` Page: ${page} of ${pageCount} `}
        <button disabled={page >= pageCount - 1} onClick={e => { e.preventDefault(); setPage(page + 1); }}>Next</button>
    </div>);
}

export default PageControls;
