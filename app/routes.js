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

// Handle risk rating edit form submission
router.post('/202601-v01/recast-risk-rating-edit', function (req, res) {
  // Store the risk rating in session
  req.session.data['riskRating'] = req.body.riskRating
  // Store the RAG rationale commentary in session
  req.session.data['ragRationale'] = req.body.ragRationale
  // Redirect back to the project page
  res.redirect('/202601-v01/recast-project')
})
