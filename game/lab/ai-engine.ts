// Simplified "learning" used by AI Trainer: counts which features appear in the examples per category
// (a tiny naive-Bayes). It is a classroom simulation, not a real machine-learning model.
export type Example = { e: string; name: string; cat: string; f: string[] }

export type Prediction = {
  cat: string
  confidence: number
  scores: Record<string, number>
}

export type Model = { n: Record<string, number>; counts: Record<string, Record<string, number>> }

export function train(examples: { cat: string; f: string[] }[], cats: string[]): Model {
  const model: Model = { n: {}, counts: {} }
  for (const c of cats) {
    model.n[c] = 0
    model.counts[c] = {}
  }
  for (const ex of examples) {
    model.n[ex.cat] = (model.n[ex.cat] ?? 0) + 1
    for (const f of ex.f) model.counts[ex.cat][f] = (model.counts[ex.cat][f] ?? 0) + 1
  }
  return model
}

export function featureShare(model: Model, cat: string, f: string) {
  return (model.counts[cat]?.[f] ?? 0) / Math.max(1, model.n[cat] ?? 0)
}

function logScore(model: Model, cat: string, f: string[]) {
  const n = model.n[cat] ?? 0
  return f.reduce((sum, feature) => sum + Math.log(((model.counts[cat]?.[feature] ?? 0) + 0.5) / (n + 1)), 0)
}

export function predict(model: Model, item: { f: string[] }, cats: string[]): Prediction {
  const raw = cats.map((c) => logScore(model, c, item.f))
  const max = Math.max(...raw)
  const exp = raw.map((v) => Math.exp(v - max))
  const total = exp.reduce((a, b) => a + b, 0)
  const scores: Record<string, number> = {}
  cats.forEach((c, i) => (scores[c] = exp[i] / total))
  let best = cats[0]
  for (const c of cats) if (scores[c] > scores[best]) best = c
  return { cat: best, confidence: scores[best], scores }
}

// The features that pushed the AI toward the wrong category, most misleading first.
export function misleadingFeatures(model: Model, item: { f: string[] }, wrong: string, right: string) {
  return item.f
    .map((feature) => ({ feature, wrong: featureShare(model, wrong, feature), right: featureShare(model, right, feature) }))
    .filter((x) => x.wrong > x.right)
    .sort((a, b) => b.wrong - b.right - (a.wrong - a.right))
}
