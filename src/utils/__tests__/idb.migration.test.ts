import { describe, it, expect } from 'vitest'
import { migrateV1ToV2, dataUrlToBlob } from '@/utils/idb.migration'
import type { WorkshopState } from '@/types/workshop'

// 1×1 透明 PNG（任意合法 base64 即可，本测试不校验 PNG 结构）
const PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

describe('idb.migration v1 → v2', () => {
  it('converts imageDataUrl entries to imageBlobId and strips base64', () => {
    const old = {
      version: 1,
      dailyStreak: 3,
      lastPracticeDate: '2026-07-01',
      skillProgress: {},
      practiceLog: [
        { id: 'a1', date: '2026-07-01', phase: 1, title: 'x', imageDataUrl: PNG_DATA_URL, reflections: ['[✓] q'] },
        { id: 'a2', date: '2026-07-02', phase: 2, title: 'y' },
      ],
    } as unknown as WorkshopState

    const { state, blobs } = migrateV1ToV2(old)

    expect(state.version).toBe(2)
    expect(state.practiceLog[0].imageBlobId).toMatch(/^img-a1-/)
    expect(blobs).toHaveLength(1)
    expect(blobs[0][0]).toBe(state.practiceLog[0].imageBlobId)
    expect(blobs[0][1]).toBeInstanceOf(Blob)
    expect((state.practiceLog[0] as unknown as { imageDataUrl?: string }).imageDataUrl).toBeUndefined()
    // 无图 entry 保持原样
    expect(state.practiceLog[1].imageBlobId).toBeUndefined()
    // 不修改入参（纯函数）
    expect((old.practiceLog[0] as unknown as { imageDataUrl?: string }).imageDataUrl).toBe(PNG_DATA_URL)
  })

  it('is idempotent for already-migrated entries', () => {
    const old = {
      version: 1,
      practiceLog: [{ id: 'a1', date: 'x', phase: 1, title: 'x', imageBlobId: 'img-a1-abc' }],
    } as unknown as WorkshopState

    const { state, blobs } = migrateV1ToV2(old)
    expect(blobs).toHaveLength(0)
    expect(state.practiceLog[0].imageBlobId).toBe('img-a1-abc')
  })

  it('drops a corrupted base64 entry but keeps the rest', () => {
    const old = {
      version: 1,
      practiceLog: [
        { id: 'a1', date: 'x', phase: 1, title: 'x', imageDataUrl: 'data:image/png;base64,!!!not-base64!!!' },
        { id: 'a2', date: 'y', phase: 2, title: 'y' },
      ],
    } as unknown as WorkshopState

    const { state, blobs } = migrateV1ToV2(old)
    expect(blobs).toHaveLength(0)
    expect(state.practiceLog).toHaveLength(2)
    expect(state.practiceLog[0].imageBlobId).toBeUndefined()
    expect((state.practiceLog[0] as unknown as { imageDataUrl?: string }).imageDataUrl).toBeUndefined()
  })

  it('dataUrlToBlob produces a Blob with correct mime', () => {
    const blob = dataUrlToBlob(PNG_DATA_URL)
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBeGreaterThan(0)
  })
})
