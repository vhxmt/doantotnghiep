import { cn } from '../../utils/cn'

const LoadingSpinner = ({ 
  size = 'md', 
  className,
  color = 'primary',
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500',
    accent: 'border-accent-500'
  }

  return (
    <div
      className={cn(
        'spinner',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    />
  )
}

export default LoadingSpinner
