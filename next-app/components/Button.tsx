import React, { ButtonHTMLAttributes } from 'react'

export function Button({ children, className: cn, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const cnn = cn ? cn : ''
  return (
    <button {...props} className={`bg-green-200 py-2 px-3 rounded shadow ${cnn}`}>
      {children}
    </button>
  )
}
