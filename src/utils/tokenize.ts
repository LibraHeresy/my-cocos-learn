/**
 * 轻量中文分词：ASCII 小写 + 拉丁词/标识符按非字母数字切分（Cocos、AABB、cc.tween 精确命中）
 * + CJK 连续片段逐相邻字符 bigram（免分词器即覆盖中文）。
 */
export function tokenize(text: string): string[] {
  const tokens: string[] = []
  const lower = text.toLowerCase()

  for (const m of lower.matchAll(/[a-z0-9_.-]+/g)) {
    tokens.push(m[0])
  }

  const cjk = lower.match(/[一-鿿]+/g) ?? []
  for (const seg of cjk) {
    if (seg.length === 1) {
      tokens.push(seg)
    }
    for (let i = 0; i < seg.length - 1; i++) {
      tokens.push(seg.slice(i, i + 2))
    }
  }

  return [...new Set(tokens)]
}
