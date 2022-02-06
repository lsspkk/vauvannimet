import React, { ButtonHTMLAttributes } from 'react'

export function Button({ children, className: cn, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const cnn = cn ? cn : ''
  const bg = props.disabled ? 'bg-gray-200' : 'bg-green-200'
  return (
    <button {...props} className={`text-xs md:text-sm lg:text-base ${bg} py-2 px-3 rounded shadow ${cnn}`}>
      {children}
    </button>
  )
}
