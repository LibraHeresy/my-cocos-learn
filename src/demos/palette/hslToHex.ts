/**
 * HSL → HEX 转换工具（调色板演示用）。
 * h ∈ [0, 360)，s / l ∈ [0, 100]。
 * 返回形如 '#e07b3c' 的 6 位 hex 字符串。
 */
export function hslToHex(h: number, s: number, l: number): string {
  const sN = Math.min(100, Math.max(0, s)) / 100
  const lN = Math.min(100, Math.max(0, l)) / 100
  const hN = ((h % 360) + 360) % 360

  const c = (1 - Math.abs(2 * lN - 1)) * sN
  const hp = hN / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))

  let r = 0
  let g = 0
  let b = 0
  if (hp < 1) {
    r = c
    g = x
  } else if (hp < 2) {
    r = x
    g = c
  } else if (hp < 3) {
    g = c
    b = x
  } else if (hp < 4) {
    g = x
    b = c
  } else if (hp < 5) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  const m = lN - c / 2
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
