import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import "./Modal.css";

export default function Modal({ isOpen, onClose, title, children, footer }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="elite-modal-overlay" 
      onClick={onClose} 
      ref={overlayRef}
      role="dialog" 
      aria-modal="true"
    >
      <div className="elite-modal-window" onClick={(e) => e.stopPropagation()}>
        <header className="elite-modal-header">
          <h3 className="elite-modal-title">{title}</h3>
          <button 
            type="button" 
            className="elite-modal-close-btn" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        
        <div className="elite-modal-body">
          {children}
        </div>
        
        {footer && (
          <footer className="elite-modal-footer">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};