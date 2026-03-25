//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// Handle Team leader edit form submission
router.post('/202601-v01/recast-team-leader-edit', function (req, res) {
  // Store the Team leader email in session
  req.session.data['teamLeaderEmail'] = req.body.teamLeaderEmail
  // Redirect back to the project page
  res.redirect('/202601-v01/recast-project')
})

// Handle add concern form submission - redirect to check your answer
router.post('/202601-v01/recast-create-add-concern-check-your-answer', function (req, res) {
  req.session.data['concernType'] = req.body.concernType
  req.session.data['concernRiskRating'] = req.body.concernRiskRating
  req.session.data['concernSource'] = req.body.concernSource
  req.session.data['ragRationaleAvailable'] = req.body.contact
  req.session.data['ragRationaleCommentary'] = req.body.contactByEmail
  res.redirect('/202601-v01/recast-create-add-concern-check-your-answer')
})

// Handle risk to trust (create case) form - save and go to concern details
router.post('/202601-v01/recast-create-risk-to-trust', function (req, res) {
  req.session.data['riskToTrustRating'] = req.body.concernRiskRating
  req.session.data['ragRationaleAvailable'] = req.body.contact
  req.session.data['ragRationaleCommentary'] = req.body.contactByEmail
  res.redirect('/202601-v01/recast-create-concern-details')
})

// Complete project flow – save conversion date from resume page (validate: not in the past).
// Session keys are prefixed per project so dates and errors are not shared between flows.
function handleCompleteProjectResume (req, res, sessionKeyPrefix, resumePath, afterPath) {
  const d = req.session.data
  const dayStr = String(req.body['conversion-date-day'] || '').trim()
  const monthStr = String(req.body['conversion-date-month'] || '').trim()
  const yearStr = String(req.body['conversion-date-year'] || '').trim()

  d[`${sessionKeyPrefix}-conversion-date-day`] = dayStr
  d[`${sessionKeyPrefix}-conversion-date-month`] = monthStr
  d[`${sessionKeyPrefix}-conversion-date-year`] = yearStr

  const day = parseInt(dayStr, 10)
  const month = parseInt(monthStr, 10)
  const year = parseInt(yearStr, 10)

  let errorMessage = null

  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    errorMessage = 'Enter the conversion date using day, month and year.'
  } else {
    const entered = new Date(year, month - 1, day)
    const isRealDate =
      entered.getFullYear() === year &&
      entered.getMonth() === month - 1 &&
      entered.getDate() === day

    if (!isRealDate) {
      errorMessage = 'The conversion date must be a real date.'
    } else {
      const today = new Date()
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      if (entered < startOfToday) {
        errorMessage = 'The conversion date cannot be in the past. It must be today or in the future.'
      }
    }
  }

  const errFlag = `${sessionKeyPrefix}-conversionDateError`
  const errMsg = `${sessionKeyPrefix}-conversionDateErrorMessage`

  if (errorMessage) {
    d[errFlag] = true
    d[errMsg] = errorMessage
    return res.redirect(resumePath)
  }

  delete d[errFlag]
  delete d[errMsg]
  res.redirect(afterPath)
}

router.post('/202603-v01/complete-project-2-resume', function (req, res) {
  handleCompleteProjectResume(
    req,
    res,
    'complete-project-2',
    '/202603-v01/complete-project-2-resume-page-1',
    '/202603-v01/complete-project-2-after'
  )
})

router.post('/202603-v01/complete-project-3-resume', function (req, res) {
  handleCompleteProjectResume(
    req,
    res,
    'complete-project-3',
    '/202603-v01/complete-project-3-resume-page-1',
    '/202603-v01/complete-project-3-after'
  )
})

router.post('/202603-v01/complete-project-4-resume', function (req, res) {
  handleCompleteProjectResume(
    req,
    res,
    'complete-project-4',
    '/202603-v01/complete-project-4-resume-page-1',
    '/202603-v01/complete-project-4-after'
  )
})

// Handle risk rating edit form submission
router.post('/202601-v01/recast-risk-rating-edit', function (req, res) {
  // Store the risk rating in session
  req.session.data['riskRating'] = req.body.riskRating
  // Store the RAG rationale commentary in session
  req.session.data['ragRationale'] = req.body.ragRationale
  // Redirect back to the project page
  res.redirect('/202601-v01/recast-project')
})
