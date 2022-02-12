import React, { ButtonHTMLAttributes, HTMLAttributes } from 'react'

export function Title({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className='mt-4 mb-2 text-1xl md:text-2xl font-bold'>
      {children}
    </div>
  )
}
