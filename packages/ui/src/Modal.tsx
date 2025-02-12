"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";

interface ModalProps {
  inView: boolean;
  handleView: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title: string;
  children: ReactNode;
  preventClose?: boolean;
  confirmText?: string;
}

export default function Modal({
  inView,
  handleView,
  onConfirm,
  onCancel,
  title,
  children,
  preventClose = false,
  confirmText = "Confirmar",
}: ModalProps) {
  const handleClose = () => {
    handleView();
    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    handleView();
    if (onConfirm) {
      onConfirm();
    }
  };

  useEffect(() => {
    const modal = document.querySelector("#modal");
    if (inView) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        modal?.classList.remove("opacity-0");
        modal?.classList.remove("translate-y-8");
      }, 25);
    } else {
      document.body.style.overflow = "";
      setTimeout(() => {
        modal?.classList.add("opacity-0");
        modal?.classList.add("translate-y-8");
      }, 25);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [inView]);

  return (
    <>
      {inView && (
        <div className={`fixed text-primary inset-0 z-50 flex items-center justify-center`}>
          {preventClose ? (
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          ) : (
            <div
              className="absolute inset-0 bg-gray-500 opacity-75"
              onClick={handleClose}
            ></div>
          )}

          <div
            id="modal"
            className={`relative z-10 mx-2 max-h-[90vh] w-full translate-y-8 overflow-y-auto rounded-md bg-background p-6 opacity-0 shadow-lg transition-all duration-300 md:max-h-[75vh] md:w-fit md:max-w-[60%] md:min-w-[30%]`}
          >
            <button
              className="absolute top-0 right-0 m-2 rounded-md border-2 border-red-500 p-1 font-semibold text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white"
              onClick={handleClose}
            >
              <AiOutlineClose />
            </button>
            <header className="flex">
              <h1 className="mt-4 text-xl  font-bold">{title}</h1>
            </header>
            <main className="mt-4 mb-8">{children}</main>
            <footer className="flex items-center justify-center gap-4">
              {onConfirm && (
                <button
                  className="rounded-md border-2 border-green-500 p-1 text-green-500 transition-all duration-300 hover:bg-green-500 hover:text-white"
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
              )}
              {onCancel && (
                <button
                  className="rounded-md border-2 border-red-500 p-1 font-semibold text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white"
                  onClick={handleClose}
                >
                  Cancelar
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
