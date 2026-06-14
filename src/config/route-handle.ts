/**
 * Metadata attached to routes via their `handle`, consumed by the layout to
 * render the document/page title and breadcrumb trail. Keeping this in the
 * route definitions means titles and crumbs stay colocated with routes.
 */
export interface RouteHandle {
  /** Page title (header + document title). */
  title: string
  /** Breadcrumb label for this segment. */
  breadcrumb: string
}

export function isRouteHandle(handle: unknown): handle is RouteHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    'breadcrumb' in handle &&
    'title' in handle &&
    typeof (handle as RouteHandle).breadcrumb === 'string'
  )
}
