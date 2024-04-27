import React from "react";
import { background, contentWrapper } from "./Popup.module.css";

function Popup({ children, preventPropagation }: { children?: React.ReactNode, preventPropagation?: boolean }) {
  const eventHandler = (e:React.SyntheticEvent) => {
    if (preventPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (<div className={background} onClick={eventHandler} onDoubleClick={eventHandler} onDrag={eventHandler} onDragEnd={eventHandler} onDragEnter={eventHandler}>
    <div className={contentWrapper}>{children}</div>
  </div>);
}

export default Popup;
