import React from 'react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Delete Chat Session?",
  description = "This chat session and all its messages will be permanently deleted from your account.",
  sessionPreview = ""
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon">🗑️</div>
          <h2>{title}</h2>
        </div>

        {/* Content */}
        <div className="modal-content">
          <p className="modal-description">{description}</p>
          
          {sessionPreview && (
            <div className="session-preview-box">
              <p className="preview-label">Chat to be deleted:</p>
              <p className="preview-text">"{sessionPreview}"</p>
            </div>
          )}

          <div className="warning-box">
            <span className="warning-icon">⚠️</span>
            <p>This action cannot be undone. Please be sure before proceeding.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="modal-btn modal-btn-cancel"
            onClick={onCancel}
          >
            Keep It
          </button>
          <button 
            className="modal-btn modal-btn-delete"
            onClick={onConfirm}
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
