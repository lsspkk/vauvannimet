import { HeartInterface } from 'lib/heart'
import { Spinner } from './Spinner'
import { useSaveHearts, useStateValue } from './state/state'
import { useState } from 'react'
import { Button, ButtonSmall } from './Button'

function Dialog({
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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative overflow-y-auto max-h-[90vh] min-h-[100dvh] sm:min-h-0 sm:h-auto">
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

export function TykkaystenHallintaDialog() {
  const [{ hearts, username }] = useStateValue()
  const { save, saving } = useSaveHearts()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Filter hearts for the current user
  const userHearts = hearts.filter((h) => h.username === username)
  const allNames = userHearts.map((h) => h.name)

  // Do not show the button if there are no names
  if (userHearts.length === 0) return null

  function toggleSelect(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }
  function selectAll() {
    setSelected(allNames)
  }
  function deselectAll() {
    setSelected([])
  }
  function handleClose() {
    setSelected([])
    setOpen(false)
  }
  async function handleDelete() {
    setLoading(true)
    // Only send selected hearts for deletion
    const heartsToDelete: HeartInterface[] = hearts
      .filter((h) => h.username === username && selected.includes(h.name))
      .map((h) => ({ ...h, onSave: 'delete' }))
    try {
      await save(heartsToDelete)
      setSelected([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button className="my-4" onClick={() => setOpen(true)}>
        Tykkäysten hallinta
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">Tykkäysten hallinta</div>
          <div className="flex gap-2">
            <ButtonSmall className="text-xs px-2 py-1" onClick={selectAll}>
              Valitse kaikki
            </ButtonSmall>
            <ButtonSmall className="text-xs px-2 py-1" onClick={deselectAll}>
              Poista valinnat
            </ButtonSmall>
          </div>
        </div>
        {userHearts.length === 0 ? (
          <div>Sinulla ei ole yhtään tykättyä nimeä.</div>
        ) : (
          <>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
              {userHearts.map((heart, i) => (
                <label
                  key={`remove-heart-${i}`}
                  className="flex items-center gap-2 bg-gray-50 border rounded px-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(heart.name)}
                    onChange={() => toggleSelect(heart.name)}
                    className="accent-pink-500"
                  />
                  <span>{heart.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-12 justify-end">
              <Button
                className="bg-gray-200 hover:bg-gray-400 text-xs px-4 py-2"
                onClick={handleClose}
                disabled={loading || saving}
              >
                Keskeytä
              </Button>
              <Button
                className="bg-teal-200 text-xs px-4 py-2"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading || saving}
              >
                {saving && (
                  <Spinner
                    className="inline-block mr-2 align-middle"
                    size={16}
                  />
                )}
                Poista valitut
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </>
  )
}
