const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-[80%] max-h-[90vh] overflow-y-auto rounded-sm bg-white shadow-default dark:bg-boxdark">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-xl font-bold text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;