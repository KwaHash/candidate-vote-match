import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

interface VotePaginationProps {
  totalPages: number
  currentPage: number
  setCurrentPage: (page: number) => void
}

const VotePagination = ({ totalPages, currentPage, setCurrentPage }: VotePaginationProps) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <Pagination className='my-10'>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) setCurrentPage(currentPage - 1)
            }}
            className={cn('rounded-none hover:bg-green-600/80 transition-all duration-300 cursor-pointer px-3', currentPage === 1 ? 'pointer-events-none opacity-50' : '')}
          />
        </PaginationItem>

        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage(page as number)
                }}
                className='hover:bg-green-600/80 transition-all duration-300 cursor-pointer'
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href='#'
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) setCurrentPage(currentPage + 1)
            }}
            className={cn('rounded-none hover:bg-green-600/80 transition-all duration-300 cursor-pointer px-3', currentPage === totalPages ? 'pointer-events-none opacity-50' : '')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default VotePagination