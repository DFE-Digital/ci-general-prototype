//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const path = require('path')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// Significant change tasks: remember whether to return to preview or the task list
function hasRadioValue (value) {
  if (value === undefined || value === null) {
    return false
  }
  return String(value).trim() !== ''
}

const sigChangeRadioFields = {
  'admissions-variation': [
    { name: 'admissions-variation-required', text: 'Select whether an admissions variation is required' },
    { name: 'admissions-variation-la-supportive', text: 'Select whether the LA is supportive of the admissions variation' },
    { name: 'admissions-variation-pupil-place-planning-supportive', text: 'Select whether the Pupil Place Planning Team is supportive of the admissions variation' },
    { name: 'admissions-variation-admissions-team-supportive', text: 'Select whether the Admissions Team is supportive of the admissions variation' }
  ],
  consultation: [
    { name: 'consultation-carried-out', text: 'Select whether a 3 week consultation has been completed' }
  ],
  'stakeholder-engagement': [
    { name: 'stakeholder-engagement-carried-out', text: 'Select whether the trust has consulted stakeholders about the planned significant change' },
    { name: 'stakeholder-engagement-objections-raised', text: 'Select whether any objections were raised' },
    { name: 'stakeholder-engagement-consultation-included-admissions-variation', text: 'Select whether the relevant stakeholders have been notified of the admissions changes' }
  ],
  'la-objections': [
    { name: 'la-objections-raised', text: 'Select whether a LA has raised any objections' }
  ],
  'religious-bodies': [
    { name: 'religious-bodies-consulted', text: 'Select whether the relevant religious bodies have been consulted' },
    { name: 'religious-bodies-objections-raised', text: 'Select whether the relevant religious body has raised any objections' }
  ],
  psed: [
    { name: 'psed-considered', text: 'Select whether the Public Sector Equality Duty has been considered and an Equalities Impact Assessment has been completed' },
    { name: 'psed-disproportionate-impact', text: 'Select how likely the decision is to disproportionately affect any particular person or group who share protected characteristics' }
  ],
  'land-transaction': [
    { name: 'land-transaction-required', text: 'Select whether the landowner has submitted a land transaction application' },
    { name: 'land-transaction-team-consented', text: 'Select whether the Land Transaction Team has consented to the change' }
  ],
  'land-transaction-team': [
    { name: 'land-transaction-team-contacted', text: 'Select whether the Land transaction Team has been contacted' }
  ],
  'planning-permission': [
    { name: 'planning-permission-required', text: 'Select whether planning permission has been secured' }
  ],
  funding: [
    { name: 'funding-considered', text: 'Select whether funding has been secured' }
  ],
  'fha-outcomes': [
    { name: 'fha-outcomes-recorded', text: 'Select whether any risks or issues have been raised in the FHA' }
  ],
  'high-quality-inclusive-education': [
    { name: 'hqie-supports', text: 'Select whether any issues or risks have been identified with regards to the HQTF pillars' }
  ],
  'school-improvement': [
    { name: 'school-improvement-supports', text: 'Select whether the proposal supports school improvement' }
  ],
  workforce: [
    { name: 'workforce-considered', text: 'Select whether workforce implications have been considered' }
  ],
  'finance-and-operations': [
    { name: 'finance-and-operations-considered', text: 'Select whether finance and operations have been considered' }
  ],
  'governance-and-leadership': [
    { name: 'governance-and-leadership-considered', text: 'Select whether governance and leadership have been considered' }
  ],
  approve: [
    { name: 'recommendation', text: 'Select a recommendation' }
  ],
  'approve-with-conditions': [
    { name: 'approve-with-conditions-recommendation', text: 'Select whether you recommend that this application is approved with conditions' }
  ],
  defer: [
    { name: 'defer-recommendation', text: 'Select whether you recommend that this application is deferred' }
  ],
  withdraw: [
    { name: 'withdraw-recommendation', text: 'Select whether you recommend that this application is withdrawn' }
  ],
  decline: [
    { name: 'decline-recommendation', text: 'Select whether you recommend that this application is declined' }
  ],
  'record-the-decision': [
    { name: 'recorded-decision', text: 'Select a decision' }
  ]
}

function taskPageUrl (req, page) {
  let url = '/202609v3/' + page
  if (req.session.data && req.session.data.returnTo === 'preview') {
    url += '?returnTo=preview'
    if (req.session.data.section) {
      url += '&section=' + encodeURIComponent(req.session.data.section)
    }
  }
  return url
}

function radioErrorList (body, fields) {
  return fields
    .filter(function (field) {
      return !hasRadioValue(body[field.name])
    })
    .map(function (field) {
      return {
        text: field.text,
        href: '#' + field.name,
        name: field.name
      }
    })
}

function dateParts (body, prefix) {
  return {
    day: String(body[prefix + '-day'] || '').trim(),
    month: String(body[prefix + '-month'] || '').trim(),
    year: String(body[prefix + '-year'] || '').trim()
  }
}

function isRealDate (day, month, year) {
  const d = parseInt(day, 10)
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
    return false
  }
  if (String(y).length !== 4) {
    return false
  }
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

function dateFieldError (body, prefix, label) {
  const parts = dateParts(body, prefix)
  const missing = []
  if (!parts.day) {
    missing.push('day')
  }
  if (!parts.month) {
    missing.push('month')
  }
  if (!parts.year) {
    missing.push('year')
  }

  if (missing.length === 3) {
    return {
      name: prefix,
      text: 'Enter the ' + label,
      href: '#' + prefix + '-day',
      missing: missing
    }
  }

  if (missing.length) {
    let missingText
    if (missing.length === 1) {
      missingText = 'a ' + missing[0]
    } else {
      missingText = 'a ' + missing[0] + ' and ' + missing[1]
    }
    return {
      name: prefix,
      text: 'The ' + label + ' must include ' + missingText,
      href: '#' + prefix + '-' + missing[0],
      missing: missing
    }
  }

  if (!isRealDate(parts.day, parts.month, parts.year)) {
    return {
      name: prefix,
      text: 'The ' + label + ' must be a real date',
      href: '#' + prefix + '-day',
      missing: ['day', 'month', 'year']
    }
  }

  return null
}

function confirmProjectDatesErrors (body) {
  return [
    dateFieldError(body, 'proposed-decision-date', 'proposed decision date'),
    dateFieldError(body, 'proposed-implementation-date', 'proposed implementation date')
  ].filter(Boolean)
}

const ofstedRadioFields = {
  'pre-2024-09-19': {
    name: 'ofsted-inspection-considered',
    details: 'ofsted-inspection-considered-details',
    text: 'Select whether the academy is rated good or outstanding'
  },
  '2024-09-19-to-2025-11-09': {
    name: 'ofsted-inspection-leadership-education',
    details: 'ofsted-inspection-leadership-education-details',
    text: 'Select whether the academy is rated good or outstanding in leadership and management and quality of education'
  },
  'post-2025-11-09': {
    name: 'ofsted-inspection-evaluation-standard',
    details: 'ofsted-inspection-evaluation-standard-details',
    text: 'Select whether the academy is meeting expected standard, strong standard or exceptional in all evaluation areas'
  }
}

function ofstedFrameworkFromParts (day, month, year) {
  if (!isRealDate(day, month, year)) {
    return null
  }
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
  const firstFrameworkEnd = new Date(2024, 8, 19)
  const secondFrameworkEnd = new Date(2025, 10, 9)
  if (date < firstFrameworkEnd) {
    return 'pre-2024-09-19'
  }
  if (date <= secondFrameworkEnd) {
    return '2024-09-19-to-2025-11-09'
  }
  return 'post-2025-11-09'
}

function ofstedFrameworkFromData (data) {
  const source = data || {}
  return ofstedFrameworkFromParts(
    source['ofsted-inspection-date-day'],
    source['ofsted-inspection-date-month'],
    source['ofsted-inspection-date-year']
  )
}

function clearOtherOfstedAnswers (data, framework) {
  Object.keys(ofstedRadioFields).forEach(function (key) {
    if (key !== framework) {
      delete data[ofstedRadioFields[key].name]
      delete data[ofstedRadioFields[key].details]
    }
  })
}

function storeRadioErrors (req, page, errorList) {
  const errors = {}
  errorList.forEach(function (item) {
    errors[item.name] = { text: item.text, missing: item.missing }
  })
  req.session.data['radio-errors'] = {
    page: page,
    errorList: errorList,
    errors: errors
  }
}

function clearRadioErrors (req, page) {
  const current = req.session.data['radio-errors']
  if (current && current.page === page) {
    delete req.session.data['radio-errors']
  }
}

// Significant change tasks: remember whether to return to preview or the task list
const sigChangeTaskPages = [
  'confirm-project-dates',
  'select-change-type',
  'admissions-variation',
  'consultation',
  'stakeholder-engagement',
  'la-objections',
  'religious-bodies',
  'ofsted-inspection',
  'ofsted-inspection-question',
  'psed',
  'land-transaction',
  'planning-permission',
  'funding',
  'financial-health-assessment',
  'fha-outcomes',
  'high-quality-inclusive-education',
  'school-improvement',
  'workforce',
  'finance-and-operations',
  'governance-and-leadership',
  'approve',
  'approve-with-conditions',
  'defer',
  'withdraw',
  'decline'
]

router.use(function (req, res, next) {
  if (req.method !== 'GET') {
    return next()
  }

  const match = req.path.match(/^\/(202608v2|202609v3)\/([^/]+)\/?$/)
  if (!match || !sigChangeTaskPages.includes(match[2])) {
    return next()
  }

  const version = match[1]

  // autoStoreData copies session into res.locals before routes run, so update both
  if (!req.session.data) {
    req.session.data = {}
  }
  if (!res.locals.data) {
    res.locals.data = {}
  }

  if (req.query.returnTo === 'preview') {
    const section = req.query.section ? ('?section=' + encodeURIComponent(req.query.section)) : ''
    const returnUrl = '/' + version + '/preview-document' + section
    req.session.data['sig-change-return-to'] = returnUrl
    res.locals.data['sig-change-return-to'] = returnUrl
    req.session.data.returnTo = 'preview'
    res.locals.data.returnTo = 'preview'
    if (req.query.section) {
      req.session.data.section = req.query.section
      res.locals.data.section = req.query.section
    }
  } else {
    const returnUrl = '/' + version + '/st-theresas'
    req.session.data['sig-change-return-to'] = returnUrl
    res.locals.data['sig-change-return-to'] = returnUrl
    // Clear query values that autoStoreData may have kept from a previous preview visit
    delete req.session.data.returnTo
    delete res.locals.data.returnTo
    delete req.session.data.section
    delete res.locals.data.section
  }

  next()
})

router.use(function (req, res, next) {
  const match = req.path.match(/^\/202609v3\/([^/]+)\/?$/)
  const page = match ? match[1] : null
  const errorsState = req.session.data && req.session.data['radio-errors']

  if (errorsState && page === errorsState.page) {
    res.locals.errorList = errorsState.errorList
    res.locals.errors = errorsState.errors
  } else {
    res.locals.errorList = []
    res.locals.errors = {}
  }

  next()
})

router.post('/202609v3/decision', function (req, res) {
  if (!req.session.data) {
    req.session.data = {}
  }

  const errorList = radioErrorList(req.body, sigChangeRadioFields['record-the-decision'])
  if (errorList.length) {
    storeRadioErrors(req, 'record-the-decision', errorList)
    return res.redirect('/202609v3/record-the-decision')
  }
  clearRadioErrors(req, 'record-the-decision')

  if (req.body['recorded-decision'] && !req.session.data['recorded-decision-date']) {
    const today = new Date()
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    req.session.data['recorded-decision-date'] =
      today.getDate() + ' ' + months[today.getMonth()] + ' ' + today.getFullYear()
  }

  res.redirect('/202609v3/decision')
})

router.get('/202609v3/ofsted-inspection-question', function (req, res, next) {
  if (!req.session.data) {
    req.session.data = {}
  }
  const framework = req.session.data['ofsted-inspection-framework'] || ofstedFrameworkFromData(req.session.data)
  if (!framework) {
    return res.redirect(taskPageUrl(req, 'ofsted-inspection'))
  }
  req.session.data['ofsted-inspection-framework'] = framework
  if (res.locals.data) {
    res.locals.data['ofsted-inspection-framework'] = framework
  }
  next()
})

router.post('/202609v3/ofsted-inspection', function (req, res) {
  if (!req.session.data) {
    req.session.data = {}
  }

  const error = dateFieldError(req.body, 'ofsted-inspection-date', 'date of the most recent Ofsted inspection')
  if (error) {
    storeRadioErrors(req, 'ofsted-inspection', [error])
    return res.redirect(taskPageUrl(req, 'ofsted-inspection'))
  }

  clearRadioErrors(req, 'ofsted-inspection')
  const framework = ofstedFrameworkFromData(req.body)
  req.session.data['ofsted-inspection-framework'] = framework
  clearOtherOfstedAnswers(req.session.data, framework)
  res.redirect(taskPageUrl(req, 'ofsted-inspection-question'))
})

router.post('/202609v3/ofsted-inspection-question', function (req, res) {
  if (!req.session.data) {
    req.session.data = {}
  }

  const framework = req.session.data['ofsted-inspection-framework'] || ofstedFrameworkFromData(req.session.data)
  const field = ofstedRadioFields[framework]
  if (!framework || !field) {
    return res.redirect(taskPageUrl(req, 'ofsted-inspection'))
  }

  const errorList = radioErrorList(req.body, [field])
  if (errorList.length) {
    storeRadioErrors(req, 'ofsted-inspection-question', errorList)
    return res.redirect(taskPageUrl(req, 'ofsted-inspection-question'))
  }

  clearRadioErrors(req, 'ofsted-inspection-question')
  const returnTo = req.session.data['sig-change-return-to'] || '/202609v3/st-theresas'
  res.redirect(returnTo)
})

router.post('/202609v3/:page', function (req, res, next) {
  const page = req.params.page
  const fields = sigChangeRadioFields[page]
  if (!fields && page !== 'confirm-project-dates') {
    return next()
  }

  if (!req.session.data) {
    req.session.data = {}
  }

  const errorList = page === 'confirm-project-dates'
    ? confirmProjectDatesErrors(req.body)
    : radioErrorList(req.body, fields)

  if (errorList.length) {
    storeRadioErrors(req, page, errorList)
    return res.redirect(taskPageUrl(req, page))
  }

  clearRadioErrors(req, page)
  const returnTo = req.session.data['sig-change-return-to'] || '/202609v3/st-theresas'
  res.redirect(returnTo)
})

router.get('/202605-b/download-project-template', function (req, res) {
  const filePath = path.join(
    __dirname,
    'assets/documents/greenhill-primary-school-project-template.docx'
  )
  res.download(filePath, "Greenhill Primary School's project template.docx")
})

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
