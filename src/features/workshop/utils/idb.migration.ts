import type { WorkshopState, PracticeEntry } from '@/features/workshop/types/workshop'

/** base64 dataURL → Blob（用于 v1 → v2 迁移与旧草稿图片迁移） */
export function dataUrlToBlob(dataUrl: string): Blob {
  const commaIdx = dataUrl.indexOf(',')
  const meta = commaIdx === -1 ? '' : dataUrl.slice(0, commaIdx)
  const mime = /data:([^;]+)/.exec(meta)?.[1] ?? 'image/png'
  const b64 = commaIdx === -1 ? dataUrl : dataUrl.slice(commaIdx + 1)
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

function hashString(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return (h >>> 0).toString(36)
}

export interface MigrationResult {
  state: WorkshopState
  /** 待写入 blobs store 的 [blobId, Blob] 列表 */
  blobs: Array<[string, Blob]>
}

/**
 * v1 → v2 迁移（纯函数，可单测；不执行任何 I/O）。
 * 把每条 entry 的内联 base64 imageDataUrl 解码为 Blob，生成确定性 blobId，
 * 并把 entry 字段换成 imageBlobId。幂等可重入；损坏的 base64 逐条丢弃并继续。
 */
export function migrateV1ToV2(old: unknown): MigrationResult {
  const base = old && typeof old === 'object'
    ? (old as Partial<WorkshopState> & { practiceLog?: PracticeEntry[] })
    : null
  const practiceLog = Array.isArray(base?.practiceLog) ? base.practiceLog : []

  const state: WorkshopState = {
    ...(base as WorkshopState),
    version: 2,
    practiceLog: practiceLog.map((e) => ({ ...e })),
  }

  const blobs: Array<[string, Blob]> = []
  for (const entry of state.practiceLog) {
    const legacy = entry as unknown as { imageDataUrl?: string }
    const dataUrl = legacy.imageDataUrl
    if (typeof dataUrl === 'string' && dataUrl.length > 0) {
      try {
        const blob = dataUrlToBlob(dataUrl)
        const id = `img-${entry.id}-${hashString(dataUrl)}`
        blobs.push([id, blob])
        entry.imageBlobId = id
      } catch {
        // 损坏的 base64：丢弃图片，保留 entry 继续迁移
      }
      delete legacy.imageDataUrl
    }
  }

  return { state, blobs }
}
