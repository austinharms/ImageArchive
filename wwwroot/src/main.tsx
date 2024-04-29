import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import CreateEntryPage from './pages/entry/Create';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
// @ts-ignore: CSS modules don't export as expected, ignore any value does not exist errors
import { contentWrapper } from "./main.module.css";
import './resets.css';
import NotFound from './pages/NotFound';
import ListEntryPage from './pages/entry/List';
import Popup from './components/Popup';
import ListCollectionPage from './pages/collection/List';
import NavHeader from './components/NavHeader';
import ViewEntryPage from './pages/entry/View';
import EditEntryPage from './pages/entry/Edit';
import CreateCollectionPage from './pages/collection/Create';
import ViewCollectionPage from './pages/collection/View';
import EditCollectionPage from './pages/collection/Edit';
import SearchEntryPage from './pages/entry/Search';

export interface PromptState {
  key: string,
  msg: string,
};

// @ts-ignore: Ignore msg and key not used in default context
export const PromptContext = React.createContext({ prompt: null as null | PromptState, setPrompt: (msg: string, key: string): boolean => false, clearPrompt: (key: string): boolean => false });
function Prompt({ children }: { children?: React.ReactNode }) {
  const [overlayPrompt, setOverlayPrompt] = useState(null as PromptState | null);
  const setPrompt = (msg: string, key: string) => {
    if (overlayPrompt === null) {
      setOverlayPrompt({ msg, key });
      return true;
    } else {
      return false;
    }
  };

  const clearPrompt = (key: string) => {
    if (overlayPrompt === null || overlayPrompt.key === key) {
      setOverlayPrompt(null);
      return true;
    } else {
      return false;
    }
  };

  return (<PromptContext.Provider value={{ prompt: overlayPrompt, setPrompt, clearPrompt }}>
    {overlayPrompt !== null && <Popup><h2>{overlayPrompt.msg}</h2></Popup>}
    {children}
  </PromptContext.Provider>);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename='/app'>
      <Prompt>
        <NavHeader />
        <div className={contentWrapper}>
          <Routes>
            <Route path='/entry/create' element={<CreateEntryPage />} />
            <Route path='/entry/list' element={<ListEntryPage />} />
            <Route path='/entry/search' element={<SearchEntryPage />} />
            <Route path='/entry/view/:id' element={<ViewEntryPage />} />
            <Route path='/entry/edit/:id' element={<EditEntryPage />} />
            <Route path='/collection/create' element={<CreateCollectionPage />} />
            <Route path='/collection/list' element={<ListCollectionPage />} />
            <Route path='/collection/view/:id' element={<ViewCollectionPage />} />
            <Route path='/collection/edit/:id' element={<EditCollectionPage />} />
            <Route path='/' element={<Navigate to='/entry/search' replace={true} />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      </Prompt>
    </BrowserRouter>
  </React.StrictMode>,
)
