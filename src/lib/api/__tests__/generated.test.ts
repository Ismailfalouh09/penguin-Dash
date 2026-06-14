import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { appControllerGetHello } from '../generated/endpoints/health/health'
import { useAdminCategoriesControllerFindAll } from '../generated/endpoints/admin-categories/admin-categories'

const GENERATED_ROOT = resolve(__dirname, '../generated')

describe('generated client', () => {
  it('exports request functions and query hooks', () => {
    expect(typeof appControllerGetHello).toBe('function')
    expect(typeof useAdminCategoriesControllerFindAll).toBe('function')
  })

  it('generates a models barrel that re-exports DTOs', () => {
    const indexPath = resolve(GENERATED_ROOT, 'models/index.ts')
    expect(existsSync(indexPath)).toBe(true)
    const content = readFileSync(indexPath, 'utf8')
    expect(content).toContain('./adminCategoryResponse')
    expect(content).toContain('./apiErrorResponse')
    expect(content).toContain('./loginDto')
  })

  it('marks generated files as not-for-manual-editing', () => {
    const sample = resolve(GENERATED_ROOT, 'endpoints/health/health.ts')
    const content = readFileSync(sample, 'utf8')
    expect(content).toContain('Do not edit manually')
  })

  it('wires generated calls to the central customFetch mutator', () => {
    const sample = resolve(GENERATED_ROOT, 'endpoints/admin-categories/admin-categories.ts')
    const content = readFileSync(sample, 'utf8')
    expect(content).toContain("import { customFetch } from '../../../http-client'")
  })
})
