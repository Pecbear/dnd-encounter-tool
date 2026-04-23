import { useState, useEffect } from 'react'

type InputModalProps = {
  isOpen: boolean
  title: string
  placeholder?: string
  defaultValue?: string
  confirmLabel?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function InputModal({
  isOpen,
  title,
  placeholder = '',
  defaultValue = '',
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel
}: InputModalProps) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (isOpen) setValue(defaultValue)
  }, [isOpen, defaultValue])

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">{title}</div>

        <input
          className="modal-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />

        <div className="modal-actions">
          <button className="btn util" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() => onConfirm(value)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}