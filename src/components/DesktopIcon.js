import React from "react";
import "./DesktopIcon.css";

const DesktopIcon = ({ name, icon, onDoubleClick }) => {
  return (
    <div className="desktop-icon" onDoubleClick={onDoubleClick}>
      <div className="icon">
        {typeof icon === 'string' && icon.endsWith('.png') ? (
          <img src={icon} alt={name + ' icon'} style={{ width: 48, height: 48 }} />
        ) : (
          icon
        )}
      </div>
      <div className="icon-text">{name}</div>
    </div>
  );
};

export default DesktopIcon;