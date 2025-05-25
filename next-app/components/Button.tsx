import React, { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className: cn, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`text-xs md:text-sm disabled:bg-gray-200 bg-teal-200 hover-bg-teal-300 opacity-80 lg:text-base py-2 px-2 sm:px-3 rounded shadow${
          cn ? ' ' + cn : ''
        }`}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

const ButtonSmall = React.forwardRef<HTMLButtonElement, Props>(
  ({ className: cn, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`text-xs md:text-sm opacity-80 lg:text-base py-2 px-2 rounded shadow-xs${
          cn ? ' ' + cn : ''
        }`}
      >
        {children}
      </button>
    )
  }
)
ButtonSmall.displayName = 'SmallButton'

export { Button, ButtonSmall }
