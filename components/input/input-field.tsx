'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { type Control, Controller } from 'react-hook-form'

interface ThisFCProps {
  id: string;
  value?: string;
  placeholder?: string;
  isPassword?: boolean;
  className?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<any>;
}

const InputField: React.FC<ThisFCProps> = ({
  id,
  placeholder,
  isPassword = false,
  value = '',
  className,
  disabled,
  control,
}) => {
  return (
    <Controller
      name={id}
      control={control}
      defaultValue={value}
      render={({ field }) => (
        <Input
          {...field}
          id={id}
          disabled={disabled}
          className={cn(className, 'rounded-none focus-visible:ring-[#777] focus-visible:ring-offset-0')}
          placeholder={placeholder}
          type={isPassword === false ? 'text' : 'password'}
        />
      )}
    />
  )
}

export default InputField
