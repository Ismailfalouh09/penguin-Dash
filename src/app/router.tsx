import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import type { RouteHandle } from '@/config/route-handle'
import { ROUTES } from '@/config/routes'
import { GuestRoute } from '@/features/auth/GuestRoute'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { DashboardOverviewPage } from '@/pages/DashboardOverviewPage'
import { LoginPage } from '@/pages/LoginPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { CategoriesPage } from '@/pages/catalog/CategoriesPage'
import { CategoryNewPage } from '@/pages/catalog/CategoryNewPage'
import { CategoryEditPage } from '@/pages/catalog/CategoryEditPage'
import { BrandsPage } from '@/pages/catalog/BrandsPage'
import { BrandNewPage } from '@/pages/catalog/BrandNewPage'
import { BrandEditPage } from '@/pages/catalog/BrandEditPage'
import { ProductsPage } from '@/pages/catalog/ProductsPage'
import { ProductDetailPage } from '@/pages/catalog/ProductDetailPage'
import { ProductFormPage } from '@/pages/catalog/ProductFormPage'
import { ProductReferencesPage } from '@/pages/catalog/ProductReferencesPage'
import { ReferenceNewPage, ReferenceEditPage } from '@/pages/catalog/ReferenceFormPage'
import { ReferenceDetailPage } from '@/pages/catalog/ReferenceDetailPage'
import { PacksPage } from '@/pages/catalog/PacksPage'
import { PackDetailPage } from '@/pages/catalog/PackDetailPage'
import { PackFormPage } from '@/pages/catalog/PackFormPage'
import { MediaPage } from '@/pages/catalog/MediaPage'
import { AttributesPage } from '@/pages/personalization/AttributesPage'
import { QuizPage } from '@/pages/personalization/QuizPage'
import { RecommendationRulesPage } from '@/pages/personalization/RecommendationRulesPage'
import { OrdersPage } from '@/pages/sales/OrdersPage'
import { OrderDetailPage } from '@/pages/sales/OrderDetailPage'
import { ProfilePage } from '@/pages/account/ProfilePage'
import { DiagnosticsPage } from '@/pages/DiagnosticsPage'
import { ComponentsDemoPage } from '@/pages/ComponentsDemoPage'

/** Typed helper so each route's handle is checked against RouteHandle. */
const handle = (h: RouteHandle): RouteHandle => h

/** Route configuration, exported so tests can build a memory router from it. */
export const routes: RouteObject[] = [
  {
    // Guest-only: authenticated admins are redirected away from /login.
    element: <GuestRoute />,
    children: [
      {
        path: ROUTES.login,
        element: <LoginPage />,
      },
    ],
  },
  {
    // Everything below requires an authenticated session.
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        handle: handle({ title: 'Dashboard', breadcrumb: 'Dashboard' }),
        children: [
          { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
          {
            path: 'dashboard',
            element: <DashboardOverviewPage />,
            handle: handle({ title: 'Overview', breadcrumb: 'Overview' }),
          },

          // Catalog
          {
            path: 'categories',
            handle: handle({ title: 'Categories', breadcrumb: 'Categories' }),
            children: [
              { index: true, element: <CategoriesPage /> },
              {
                path: 'new',
                element: <CategoryNewPage />,
                handle: handle({ title: 'New category', breadcrumb: 'New' }),
              },
              {
                path: ':categoryId/edit',
                element: <CategoryEditPage />,
                handle: handle({ title: 'Edit category', breadcrumb: 'Edit' }),
              },
            ],
          },
          {
            path: 'brands',
            handle: handle({ title: 'Brands', breadcrumb: 'Brands' }),
            children: [
              { index: true, element: <BrandsPage /> },
              {
                path: 'new',
                element: <BrandNewPage />,
                handle: handle({ title: 'New brand', breadcrumb: 'New' }),
              },
              {
                path: ':brandId/edit',
                element: <BrandEditPage />,
                handle: handle({ title: 'Edit brand', breadcrumb: 'Edit' }),
              },
            ],
          },
          {
            path: 'products',
            handle: handle({ title: 'Products', breadcrumb: 'Products' }),
            children: [
              { index: true, element: <ProductsPage /> },
              {
                path: 'new',
                element: <ProductFormPage />,
                handle: handle({ title: 'New product', breadcrumb: 'New' }),
              },
              {
                path: ':productId',
                element: <ProductDetailPage />,
                handle: handle({ title: 'Product details', breadcrumb: 'Details' }),
              },
              {
                path: ':productId/edit',
                element: <ProductFormPage />,
                handle: handle({ title: 'Edit product', breadcrumb: 'Edit' }),
              },
              {
                path: ':productId/references',
                handle: handle({ title: 'Product references', breadcrumb: 'References' }),
                children: [
                  { index: true, element: <ProductReferencesPage /> },
                  {
                    path: 'new',
                    element: <ReferenceNewPage />,
                    handle: handle({ title: 'New reference', breadcrumb: 'New' }),
                  },
                ],
              },
            ],
          },
          {
            path: 'product-references',
            handle: handle({ title: 'Product references', breadcrumb: 'References' }),
            children: [
              {
                path: ':referenceId',
                element: <ReferenceDetailPage />,
                handle: handle({ title: 'Reference details', breadcrumb: 'Details' }),
              },
              {
                path: ':referenceId/edit',
                element: <ReferenceEditPage />,
                handle: handle({ title: 'Edit reference', breadcrumb: 'Edit' }),
              },
            ],
          },
          {
            path: 'packs',
            handle: handle({ title: 'Packs', breadcrumb: 'Packs' }),
            children: [
              { index: true, element: <PacksPage /> },
              {
                path: 'new',
                element: <PackFormPage />,
                handle: handle({ title: 'New pack', breadcrumb: 'New' }),
              },
              {
                path: ':packId',
                element: <PackDetailPage />,
                handle: handle({ title: 'Pack details', breadcrumb: 'Details' }),
              },
              {
                path: ':packId/edit',
                element: <PackFormPage />,
                handle: handle({ title: 'Edit pack', breadcrumb: 'Edit' }),
              },
            ],
          },
          {
            path: 'media',
            element: <MediaPage />,
            handle: handle({ title: 'Media library', breadcrumb: 'Media library' }),
          },

          // Personalization
          {
            path: 'attributes',
            element: <AttributesPage />,
            handle: handle({ title: 'Attributes', breadcrumb: 'Attributes' }),
          },
          {
            path: 'quiz',
            element: <QuizPage />,
            handle: handle({ title: 'Quiz', breadcrumb: 'Quiz' }),
          },
          {
            path: 'recommendation-rules',
            element: <RecommendationRulesPage />,
            handle: handle({ title: 'Recommendation rules', breadcrumb: 'Recommendation rules' }),
          },

          // Sales
          {
            path: 'orders',
            handle: handle({ title: 'Orders', breadcrumb: 'Orders' }),
            children: [
              { index: true, element: <OrdersPage /> },
              {
                path: ':orderId',
                element: <OrderDetailPage />,
                handle: handle({ title: 'Order details', breadcrumb: 'Details' }),
              },
            ],
          },

          // Administration
          {
            path: 'profile',
            element: <ProfilePage />,
            handle: handle({ title: 'Profile', breadcrumb: 'Profile' }),
          },
          {
            path: 'forbidden',
            element: <ForbiddenPage />,
            handle: handle({ title: 'Access denied', breadcrumb: 'Access denied' }),
          },

          // Development-only API diagnostics (not in sidebar navigation).
          {
            path: 'diagnostics',
            element: <DiagnosticsPage />,
            handle: handle({ title: 'API diagnostics', breadcrumb: 'API diagnostics' }),
          },

          // Development-only shared-components demo (Task 5A; not in navigation).
          {
            path: 'components-demo',
            element: <ComponentsDemoPage />,
            handle: handle({ title: 'Shared components demo', breadcrumb: 'Components demo' }),
          },

          // Catch-all (inside the shell so navigation is preserved)
          {
            path: '*',
            element: <NotFoundPage />,
            handle: handle({ title: 'Page not found', breadcrumb: 'Not found' }),
          },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
