import React from "react";
import PropTypes from "prop-types";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="confirm-dialog-content">
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  confirmVariant: PropTypes.oneOf(["danger", "warning", "primary", "secondary"]),
  loading: PropTypes.bool,
};