import React, { ButtonHTMLAttributes } from 'react'

export function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className='bg-green-200 py-2 px-3 rounded shadow'>
      {children}
    </button>
  )
}
