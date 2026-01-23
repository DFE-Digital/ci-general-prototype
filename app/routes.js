//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// Handle case manager edit form submission
router.post('/202601-v01/recast-case-manager-edit', function (req, res) {
  // Store the case manager email in session
  req.session.data['caseManagerEmail'] = req.body.caseManagerEmail
  // Redirect back to the project page
  res.redirect('/202601-v01/recast-project')
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
