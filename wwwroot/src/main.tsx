import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import CreateEntry from './pages/entry/Create';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { contentWrapper } from "./main.module.css";
import './resets.css';
import NotFound from './pages/NotFound';
import EntryListPage from './pages/entry/List';
import Popup from './components/Popup';
import CollectionListPage from './pages/collection/List';
import NavHeader from './components/NavHeader';
import ViewEntryPage from './pages/entry/View';
import EditEntryPage from './pages/entry/Edit';

export interface PromptState {
  key: string,
  msg: string,
};

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
            <Route path='/entry/create' element={<CreateEntry />} />
            <Route path='/entry/list' element={<EntryListPage />} />
            <Route path='/entry/view/:id' element={<ViewEntryPage />} />
            <Route path='/entry/edit/:id' element={<EditEntryPage />} />
            <Route path='/collection/list' element={<CollectionListPage />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      </Prompt>
    </BrowserRouter>
  </React.StrictMode>,
)
