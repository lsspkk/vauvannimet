import React from 'react'

export function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative overflow-y-auto max-h-[90vh] min-h-[100dvh] sm:min-h-0 sm:h-auto md:min-w-[600px]">
        <div className="p-4 sm:p-8 lg:p-12">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            onClick={onClose}
            aria-label="Sulje dialogi"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}
