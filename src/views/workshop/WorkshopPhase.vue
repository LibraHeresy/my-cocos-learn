<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getChallenge, getStageForChallenge } from '@/data/challenges'
import { SKILL_LINES } from '@/data/skill-tree'
import { usePracticeLog } from '@/composables/usePracticeLog'

const MAX_IMAGE_SIZE = 500 * 1024
const DRAFT_KEY = '__workshop_phase_form__'

const route = useRoute()
const { addPractice, updatePractice, getPhasePractice } = usePracticeLog()

const challengeId = computed(() => parseInt(route.params.phase as string) || 1)
const challenge = computed(() => getChallenge(challengeId.value))
const skillReward = computed(() => challenge.value?.skillReward ?? null)
const stage = computed(() => getStageForChallenge(challengeId.value))
const existingPractice = computed(() => getPhasePractice(challengeId.value))

// Form state
const imageDataUrl = ref<string | undefined>(existingPractice.value?.imageDataUrl)
const selfRating = ref<number>(existingPractice.value?.selfRating ?? 0)
const saved = ref(false)
const dragOver = ref(false)
const selfCheckResults = ref<Record<number, boolean | null>>({})

// Initialize selfCheckResults
onMounted(() => {
  if (!existingPractice.value && challenge.value) {
    const defaults: Record<number, boolean | null> = {}
    challenge.value.selfCheck.forEach((_, i) => { defaults[i] = null })
    selfCheckResults.value = defaults
    // restore draft
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const drafts = JSON.parse(raw)
        const key = String(challengeId.value)
        if (drafts[key]) {
          imageDataUrl.value = drafts[key].imageDataUrl
          selfCheckResults.value = drafts[key].selfCheckResults ?? defaults
          selfRating.value = drafts[key].selfRating ?? 0
        }
      }
    } catch { /* ignore */ }
  } else if (existingPractice.value && challenge.value) {
    // Load existing selfCheck from practice reflections
    const defaults: Record<number, boolean | null> = {}
    challenge.value.selfCheck.forEach((_, i) => { defaults[i] = null })
    selfCheckResults.value = defaults
  }
})

function saveDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    const drafts = raw ? JSON.parse(raw) : {}
    drafts[String(challengeId.value)] = {
      imageDataUrl: imageDataUrl.value,
      selfCheckResults: selfCheckResults.value,
      selfRating: selfRating.value,
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
  } catch { /* ignore */ }
}

function clearDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) {
      const drafts = JSON.parse(raw)
      delete drafts[String(challengeId.value)]
      localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
    }
  } catch { /* ignore */ }
}

function toggleSelfCheck(i: number) {
  if (selfCheckResults.value[i] === true) {
    selfCheckResults.value[i] = false
  } else if (selfCheckResults.value[i] === false) {
    selfCheckResults.value[i] = null
  } else {
    selfCheckResults.value[i] = true
  }
  saveDraft()
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { alert('仅支持 PNG 图片'); return }
  readFile(file)
}

function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { alert('仅支持 PNG 图片'); return }
  readFile(file)
}

function readFile(file: File) {
  if (file.size > MAX_IMAGE_SIZE) { alert('图片太大，请导出为更小的 PNG（最大 500KB）'); return }
  const reader = new FileReader()
  reader.onload = () => { imageDataUrl.value = reader.result as string; saveDraft() }
  reader.readAsDataURL(file)
}

function removeImage() { imageDataUrl.value = undefined; saveDraft() }
function setRating(r: number) { selfRating.value = r; saveDraft() }

function handleSave() {
  const c = challenge.value
  if (!c) return

  const reflectionTexts: string[] = []
  c.selfCheck.forEach((sc, i) => {
    const result = selfCheckResults.value[i]
    const status = result === true ? '✓' : result === false ? '✗' : '—'
    reflectionTexts.push(`[${status}] ${sc.question}`)
  })

  const entry = {
    date: new Date().toISOString(),
    phase: challengeId.value,
    title: c.title,
    imageDataUrl: imageDataUrl.value,
    reflections: reflectionTexts,
    selfRating: selfRating.value > 0 ? selfRating.value : undefined,
  }

  if (existingPractice.value) {
    updatePractice(existingPractice.value.id, entry)
  } else {
    addPractice(entry)
  }

  clearDraft()
  saved.value = true
  setTimeout(() => { saved.value = false }, 3000)
}

const passedCount = computed(() =>
  Object.values(selfCheckResults.value).filter((v) => v === true).length,
)
const allPassed = computed(() =>
  challenge.value ? passedCount.value === challenge.value.selfCheck.length : false,
)
</script>

<template>
  <div class="workshop-phase">
    <div class="phase-nav">
      <RouterLink to="/workshop" class="back-link">← 返回工坊</RouterLink>
      <span v-if="challenge" class="phase-badge">
        阶段 {{ stage }} · 关 {{ challengeId }}/34
      </span>
    </div>

    <div v-if="!challenge" class="not-found">
      <p>未找到挑战</p>
      <RouterLink to="/workshop">返回工坊</RouterLink>
    </div>

    <template v-if="challenge">
      <!-- Challenge Card -->
      <div class="challenge-card">
        <div class="challenge-header">
          <span class="challenge-icon">{{ challenge.icon }}</span>
          <h1>{{ challenge.title }}</h1>
        </div>
        <p class="challenge-prompt">{{ challenge.prompt }}</p>

        <div class="challenge-meta">
          <div class="meta-section">
            <h4>📐 约束</h4>
            <ul>
              <li v-for="c in challenge.constraints" :key="c">{{ c }}</li>
            </ul>
          </div>
          <div class="meta-section">
            <h4>📦 产出</h4>
            <p>{{ challenge.output.name }}（{{ challenge.output.size }}）</p>
          </div>
        </div>

        <!-- Help Refs -->
        <div v-if="challenge.helpRefs.length > 0" class="help-section">
          <h4>🆘 卡住了？</h4>
          <ul>
            <li v-for="ref in challenge.helpRefs" :key="`${ref.course}-${ref.phase}`">
              <RouterLink :to="`/${ref.course}/phase/${ref.phase}`">
                课程 Phase {{ ref.phase }} · {{ ref.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Self Check -->
      <div class="selfcheck-section">
        <h3>✅ 能力自检</h3>
        <p class="selfcheck-hint">逐项验证——诚实回答，这是你成长的刻度。</p>
        <div
          v-for="(sc, i) in challenge.selfCheck"
          :key="i"
          class="selfcheck-item"
          :class="{ passed: selfCheckResults[i] === true, failed: selfCheckResults[i] === false }"
        >
          <button class="check-btn" @click="toggleSelfCheck(i)">
            <span v-if="selfCheckResults[i] === true">✓</span>
            <span v-else-if="selfCheckResults[i] === false">✗</span>
            <span v-else>—</span>
          </button>
          <div class="check-content">
            <p class="check-question">{{ sc.question }}</p>
            <p v-if="selfCheckResults[i] === true" class="check-feedback yes">✅ {{ sc.yes }}</p>
            <p v-else-if="selfCheckResults[i] === false" class="check-feedback no">❌ {{ sc.no }}</p>
          </div>
        </div>
        <div v-if="challenge.selfCheck.length > 0" class="check-summary">
          {{ passedCount }}/{{ challenge.selfCheck.length }} 项通过
          <span v-if="allPassed" class="all-passed">🎉 全部通过！</span>
        </div>
      </div>

      <!-- Skill Reward -->
      <div v-if="skillReward" class="skill-section">
        <h3>🏆 通过后</h3>
        <p>
          <span v-for="line in SKILL_LINES.filter(l => l.id === skillReward!.skillId)" :key="line.id">
            {{ line.icon }} {{ line.name }}
          </span>
          <span v-if="skillReward!.level > 0">
            → Lv.{{ skillReward!.level }}
          </span>
        </p>
        <p class="skill-capability">你能：{{ skillReward!.capability }}</p>
      </div>

      <!-- Upload -->
      <div class="upload-section">
        <h3>📤 上传作品</h3>
        <div
          class="upload-area"
          :class="{ 'drag-over': dragOver, 'has-image': imageDataUrl }"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          @click="($refs.fileInput as HTMLInputElement)?.click()"
        >
          <template v-if="imageDataUrl">
            <img :src="imageDataUrl" class="upload-preview" />
            <button class="remove-img-btn" @click.stop="removeImage">移除</button>
          </template>
          <template v-else>
            <div class="upload-hint">
              <span class="upload-icon">🖼️</span>
              <span>拖入 PNG 或点击上传</span>
              <span class="upload-limit">最大 500KB</span>
            </div>
          </template>
        </div>
        <input ref="fileInput" type="file" accept="image/png" style="display: none" @change="handleFileSelect" />
      </div>

      <!-- Self Rating -->
      <div class="rating-section">
        <h3>⭐ 自评</h3>
        <div class="rating-row">
          <button
            v-for="r in 5" :key="r"
            class="rating-star" :class="{ active: r <= selfRating }"
            @click="setRating(r)"
          >
            {{ r <= selfRating ? '★' : '☆' }}
          </button>
          <span class="rating-label">
            {{ selfRating === 0 ? '点击评分' : selfRating === 5 ? '完美！' : selfRating >= 3 ? '不错' : '还需努力' }}
          </span>
        </div>
      </div>

      <!-- Save -->
      <div class="save-section">
        <button class="save-btn" @click="handleSave">
          {{ existingPractice ? '更新练习记录' : '保存练习记录' }}
        </button>
        <span v-if="saved" class="saved-toast">✓ 已保存</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.workshop-phase {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1.5rem 1.5rem 4rem;
}

.phase-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.back-link { font-size: 0.85rem; color: var(--color-primary); font-weight: 600; }
.phase-badge { font-size: 0.78rem; color: var(--color-text-muted); font-weight: 600; }

.not-found { text-align: center; padding: 4rem 0; color: var(--color-text-muted); }

/* Challenge Card */
.challenge-card {
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: 14px;
  padding: 1.75rem;
  margin-bottom: 1.25rem;
}

.challenge-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.challenge-icon { font-size: 1.8rem; }
.challenge-header h1 { font-size: 1.4rem; color: var(--color-text); margin: 0; }

.challenge-prompt {
  font-size: 0.92rem;
  color: var(--color-text);
  line-height: 1.8;
  margin-bottom: 1.25rem;
}

.challenge-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.meta-section { flex: 1; min-width: 180px; }
.meta-section h4 { font-size: 0.85rem; color: var(--color-text); margin-bottom: 0.35rem; }
.meta-section ul { padding-left: 1.2rem; margin: 0; }
.meta-section li, .meta-section p { font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.6; }

.help-section {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border-light);
}

.help-section h4 { font-size: 0.85rem; color: var(--color-text); margin-bottom: 0.35rem; }
.help-section ul { padding-left: 1.2rem; margin: 0; }
.help-section li { font-size: 0.82rem; line-height: 1.6; }
.help-section a { color: var(--color-primary); font-weight: 600; }

/* Self Check */
.selfcheck-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.selfcheck-section h3 { font-size: 1rem; color: var(--color-text); margin: 0 0 0.25rem; }
.selfcheck-hint { font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 0.75rem; }

.selfcheck-item {
  display: flex;
  gap: 0.6rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border-light);
  transition: background 0.15s;
}
.selfcheck-item:last-child { border-bottom: none; }
.selfcheck-item.passed { background: var(--color-success-soft); margin: 0 -0.5rem; padding: 0.5rem; border-radius: 6px; border-bottom: none; }
.selfcheck-item.failed { background: var(--color-accent-soft); margin: 0 -0.5rem; padding: 0.5rem; border-radius: 6px; border-bottom: none; }

.check-btn {
  width: 28px; height: 28px;
  flex-shrink: 0;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s;
  color: var(--color-text-muted);
}

.passed .check-btn { border-color: var(--color-success); background: var(--color-success); color: #fff; }
.failed .check-btn { border-color: var(--color-accent); background: var(--color-accent); color: #fff; }

.check-content { flex: 1; min-width: 0; }
.check-question { font-size: 0.85rem; color: var(--color-text); margin: 0; line-height: 1.5; }
.check-feedback { font-size: 0.78rem; margin: 0.2rem 0 0; line-height: 1.4; }
.check-feedback.yes { color: var(--color-success); }
.check-feedback.no { color: var(--color-accent); }

.check-summary {
  margin-top: 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.all-passed {
  color: var(--color-success);
  margin-left: 0.5rem;
}

/* Skill Reward */
.skill-section {
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.skill-section h3 { font-size: 1rem; color: var(--color-text); margin: 0 0 0.35rem; }
.skill-section p { font-size: 0.85rem; color: var(--color-text); margin: 0; }
.skill-capability { font-size: 0.82rem !important; color: var(--color-primary) !important; font-weight: 600; margin-top: 0.25rem !important; }

/* Upload */
.upload-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.upload-section h3 { font-size: 1rem; color: var(--color-text); margin: 0 0 0.5rem; }

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover, .upload-area.drag-over { border-color: var(--color-primary); background: var(--color-primary-soft); }
.upload-area.has-image { border-style: solid; padding: 0.5rem; position: relative; }

.upload-hint { display: flex; flex-direction: column; gap: 0.25rem; align-items: center; color: var(--color-text-muted); font-size: 0.85rem; }
.upload-icon { font-size: 1.5rem; }
.upload-limit { font-size: 0.7rem; color: var(--color-text-soft); }

.upload-preview { max-width: 100%; max-height: 200px; object-fit: contain; image-rendering: pixelated; border-radius: 4px; }

.remove-img-btn {
  position: absolute; top: 0.4rem; right: 0.4rem;
  background: var(--color-accent); color: #fff; border: none;
  border-radius: 4px; padding: 0.2rem 0.5rem; font-size: 0.72rem; cursor: pointer;
}

/* Rating */
.rating-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.rating-section h3 { font-size: 1rem; color: var(--color-text); margin: 0 0 0.5rem; }

.rating-row { display: flex; align-items: center; gap: 0.3rem; }

.rating-star {
  background: none; border: none; font-size: 1.5rem; cursor: pointer;
  color: var(--color-border); padding: 0; line-height: 1;
  transition: color 0.15s, transform 0.15s;
}
.rating-star.active { color: #f0b428; }
.rating-star:hover { transform: scale(1.15); }
.rating-label { margin-left: 0.5rem; font-size: 0.82rem; color: var(--color-text-muted); }

/* Save */
.save-section {
  margin-bottom: 1rem;
}

.save-btn {
  padding: 0.6rem 1.75rem;
  background: var(--color-primary); color: #fff;
  border: none; border-radius: 8px;
  font-size: 0.9rem; font-weight: 700; cursor: pointer;
  transition: background 0.2s;
}
.save-btn:hover { background: #c96a30; }
.saved-toast { margin-left: 0.75rem; font-size: 0.85rem; color: var(--color-success); font-weight: 600; }
</style>
