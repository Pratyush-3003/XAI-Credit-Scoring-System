/**
 * api.js — API service for XAI Credit Scoring.
 *
 * Calls the real FastAPI backend on Render.
 */

const API_BASE = 'https://xai-credit-score-system.onrender.com'
const TIMEOUT_MS = 30000 // 30 s — Render free tier can be slow to cold-start

/**
 * Map the simple frontend form fields → FastAPI LoanInput schema.
 */
function buildPayload(form) {
  const loanAmount = parseFloat(form.loanAmount) || 0
  const annualIncome = parseFloat(form.annualIncome) || 0
  const dti = parseFloat(form.dti) || 0
  const ficoScore = parseFloat(form.ficoScore) || 650
  const empLength = parseFloat(form.empLength) || 0
  const creditHistory = parseFloat(form.creditHistory) || 5 // default 5 years
  const intRate = parseFloat(form.intRate) || 13.5

  return {
    loan_amnt: loanAmount,
    funded_amnt: loanAmount,
    funded_amnt_inv: loanAmount,
    int_rate: intRate,
    installment: Math.round(loanAmount * 0.03 * 100) / 100,
    annual_inc: annualIncome,
    dti: dti,
    delinq_2yrs: 0,
    fico_range_low: ficoScore,
    fico_range_high: ficoScore + 4,
    inq_last_6mths: 0,
    open_acc: 10,
    pub_rec: 0,
    revol_bal: 5000,
    revol_util: 40.0,
    total_acc: 20,
    credit_history_length: creditHistory * 12, // years → months
    term: '36 months',
    grade: ficoScore >= 740 ? 'A' : ficoScore >= 700 ? 'B' : ficoScore >= 660 ? 'C' : 'D',
    emp_length: empLength >= 10 ? '10+ years' : `${Math.round(empLength)} years`,
    home_ownership: 'RENT',
    verification_status: 'Verified',
    purpose: 'debt_consolidation',
    model_choice: 'xgboost',
  }
}

/**
 * Normalise the FastAPI response into the shape our components expect.
 *
 * Components expect:
 *   - result.prediction     ("Default" | "No Default")
 *   - result.probability    (0–1)
 *   - result.shapValues     (array of { feature, value, impact })
 *   - result.explanation    (string)
 */
function normaliseBackendResponse(raw) {
  return {
    prediction: raw.prediction,                    // "Default" | "No Default"
    probability: raw.probability,                   // 0–1
    shapValues: (raw.shap_features || []).map(f => ({
      feature: f.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: f.shap_value,
      impact: f.shap_value > 0 ? 'negative' : 'positive',   // positive SHAP → raises risk
    })),
    explanation: raw.explanation_text || '',
  }
}

/**
 * Main entry point — call the real backend.
 */
export async function predictRisk(formData) {
  const payload = buildPayload(formData)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res
  try {
    res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The backend may be starting up (Render free tier). Please try again in 30 seconds.')
    }
    throw new Error('Cannot reach the backend server. Please check your internet connection and try again.')
  }
  clearTimeout(timer)

  if (!res.ok) {
    let detail = ''
    try {
      const errBody = await res.json()
      detail = errBody.detail || JSON.stringify(errBody)
    } catch {
      detail = `HTTP ${res.status}`
    }
    throw new Error(`Backend error: ${detail}`)
  }

  const data = await res.json()
  return normaliseBackendResponse(data)
}
