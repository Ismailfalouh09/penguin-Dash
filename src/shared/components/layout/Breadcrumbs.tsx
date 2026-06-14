import { Link, useMatches } from 'react-router-dom'
import { Fragment } from 'react'
import { isRouteHandle } from '@/config/route-handle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb'

/**
 * Breadcrumb trail derived from the matched routes' `handle.breadcrumb`.
 * The last crumb renders as the current page; earlier crumbs link back.
 */
export function Breadcrumbs() {
  const matches = useMatches()

  const crumbs = matches
    .filter((match) => isRouteHandle(match.handle))
    .map((match) => ({
      id: match.id,
      pathname: match.pathname,
      label: (match.handle as { breadcrumb: string }).breadcrumb,
    }))

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <Fragment key={crumb.id}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.pathname}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
