import { useEffect, useId, useRef, useState } from 'react';
import QRCode from 'qrcode';
export function ShareModal({
  isOpen,
  onClose,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [qr, setQr] = useState('');
  const [message, setMessage] = useState('');
  const [qrError, setQrError] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);
  useEffect(() => {
    if (isOpen && !ref.current?.open) ref.current?.showModal();
    if (!isOpen && ref.current?.open) ref.current?.close();
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setMessage('');
    setQr('');
    setQrError(false);
    QRCode.toDataURL(url, { width: 240, margin: 2, color: { dark: '#1c3443', light: '#ffffff' } })
      .then((data) => {
        if (active) setQr(data);
      })
      .catch(() => {
        if (active) setQrError(true);
      });
    return () => {
      active = false;
    };
  }, [url, isOpen]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Enlace copiado. Ya puedes compartir el ejercicio.');
    } catch {
      input.current?.focus();
      input.current?.select();
      setMessage('Copia el enlace seleccionado con Ctrl+C o mantén presionado el texto.');
    }
  };
  return (
    <dialog
      className="share-dialog"
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-header">
        <h2 id={`${id}-title`}>Comparte el ejercicio</h2>
        <button type="button" className="icon-button" aria-label="Cerrar diálogo" onClick={onClose}>
          ×
        </button>
      </div>
      <p id={`${id}-description`}>
        Quien abra el enlace tendrá los mismos datos. Puede editarlos y seguir su propio
        razonamiento.
      </p>
      <div className="qr-box">
        {qr ? (
          <img src={qr} alt="Código QR que abre este ejercicio" width="220" height="220" />
        ) : (
          <p role="status">
            {qrError
              ? 'El QR no está disponible. Puedes compartir el enlace.'
              : 'Generando código QR…'}
          </p>
        )}
      </div>
      <label htmlFor={`${id}-url`} className="share-label">
        Enlace del ejercicio
      </label>
      <div className="url-input-box">
        <input
          id={`${id}-url`}
          ref={input}
          type="text"
          readOnly
          value={url}
          className="url-input"
          onFocus={(e) => e.target.select()}
        />
        <button type="button" className="btn btn-primary" onClick={copy}>
          Copiar
        </button>
      </div>
      <div className="copy-status" role="status" aria-live="polite">
        {message}
      </div>
    </dialog>
  );
}
