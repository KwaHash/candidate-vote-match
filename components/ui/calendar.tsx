import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { CaptionDropdowns, DayPicker, useDayPicker, useNavigation, type CaptionProps } from 'react-day-picker'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarNavIcon({
  direction,
  components,
}: {
  direction: 'previous' | 'next'
  components: ReturnType<typeof useDayPicker>['components']
}) {
  if (direction === 'previous') {
    const IconLeft = components?.IconLeft
    return IconLeft ? <IconLeft className='h-4 w-4' /> : <ChevronLeft className='h-4 w-4' />
  }
  const IconRight = components?.IconRight
  return IconRight ? <IconRight className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />
}

function CalendarDropdownButtonsCaption(props: CaptionProps) {
  const { classNames, styles, dir, locale, labels, components } = useDayPicker()
  const { previousMonth, nextMonth, goToMonth } = useNavigation()

  return (
    <div className={cn('flex w-full items-center justify-between gap-2', classNames.caption)}>
      <button
        type='button'
        name='previous-month'
        aria-label={labels.labelPrevious(previousMonth, { locale })}
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-7 p-0 !rounded-full opacity-70 hover:!bg-green-600 hover:!text-white hover:opacity-100',
          classNames.nav_button,
          classNames.nav_button_previous
        )}
        style={styles.nav_button_previous}
      >
        {dir === 'rtl' ? (
          <CalendarNavIcon direction='next' components={components} />
        ) : (
          <CalendarNavIcon direction='previous' components={components} />
        )}
      </button>

      <CaptionDropdowns
        displayMonth={props.displayMonth}
        id={props.id}
        displayIndex={props.displayIndex}
      />

      <button
        type='button'
        name='next-month'
        aria-label={labels.labelNext(nextMonth, { locale })}
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-7 p-0 !rounded-full opacity-70 hover:!bg-green-600 hover:!text-white hover:opacity-100',
          classNames.nav_button,
          classNames.nav_button_next
        )}
        style={styles.nav_button_next}
      >
        {dir === 'rtl' ? (
          <CalendarNavIcon direction='previous' components={components} />
        ) : (
          <CalendarNavIcon direction='next' components={components} />
        )}
      </button>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout,
  components,
  ...props
}: CalendarProps) {
  const useDropdownButtonsCaption = captionLayout === 'dropdown-buttons'

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn('calendar-root p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'relative flex w-full items-center pt-1',
        caption_dropdowns: 'flex items-center justify-center gap-3',
        dropdown_month: 'relative inline-flex items-center px-0.5',
        dropdown_year: 'relative inline-flex items-center px-0.5',
        dropdown: 'absolute inset-0 z-[1] h-full w-full cursor-pointer opacity-0 text-sm',
        dropdown_icon: 'ml-1 h-2.5 w-2.5 text-muted-foreground',
        caption_label: 'inline-flex items-center gap-0.5 px-1 py-0.5 text-sm font-medium',
        vhidden: 'sr-only',
        nav: 'flex items-center gap-1',
        nav_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-7 p-0 !rounded-full opacity-70 hover:!bg-green-600 hover:!text-white hover:opacity-100'
        ),
        nav_button_previous: '',
        nav_button_next: '',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex [&>th:first-child]:!text-red-600',
        head_cell:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-green-600/20 [&:has([aria-selected])]:bg-green-600/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal !rounded-full hover:bg-gray-200 hover:text-gray-900 aria-selected:opacity-100'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          '!rounded-full bg-green-600 text-white hover:!bg-green-600 hover:!text-white focus:!bg-green-600 focus:!text-white',
        day_today:
          '!rounded-full bg-gray-200 text-gray-900 hover:!bg-gray-200 aria-selected:bg-green-600 aria-selected:text-white aria-selected:hover:!bg-green-600 aria-selected:hover:!text-white',
        day_outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-green-600/80 aria-selected:text-white aria-selected:opacity-100',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-green-600/20 aria-selected:text-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...iconProps }) => <ChevronLeft className='h-4 w-4' {...iconProps} />,
        IconRight: ({ ...iconProps }) => <ChevronRight className='h-4 w-4' {...iconProps} />,
        ...(useDropdownButtonsCaption
          ? { Caption: CalendarDropdownButtonsCaption }
          : {}),
        ...components,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
