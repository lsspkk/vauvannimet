import React, { ButtonHTMLAttributes } from 'react'

export function Button({
  children,
  className: cn,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const cnn = cn ? cn : ''
  return (
    <button
      {...props}
      className={`text-xs md:text-sm disabled:bg-gray-200 bg-teal-200 hover-bg-teal-300 opacity-80 lg:text-base py-2 px-3 rounded shadow ${cnn}`}
    >
      {children}
    </button>
  )
}
