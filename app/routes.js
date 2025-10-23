//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// Handle the CML question form submission
router.post('/temp-answers', (req, res) => {
  const cmlAnswer = req.body['cml-answer']
  res.render('temp-answers.html', { cmlAnswer })
})
