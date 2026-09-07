//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

function hasValue (value) {
  if (value === undefined || value === null) {
    return false
  }
  if (Array.isArray(value)) {
    return value.some(hasValue)
  }
  return String(value).trim() !== ''
}

function isFilled (data, key) {
  if (Array.isArray(key)) {
    return key.every(function (part) {
      return hasValue(data[part])
    })
  }
  return hasValue(data[key])
}

function isConditional (key) {
  return key && typeof key === 'object' && !Array.isArray(key)
}

function isRequired (data, key) {
  if (!isConditional(key)) {
    return true
  }
  return data[key.when] === key.equals
}

function isItemFilled (data, key) {
  if (isConditional(key)) {
    return hasValue(data[key.field])
  }
  return isFilled(data, key)
}

addFilter('taskStatus', function (data, keys) {
  const session = data || {}
  const list = Array.isArray(keys) ? keys : [keys]
  let required = 0
  let filled = 0

  list.forEach(function (key) {
    if (!isRequired(session, key)) {
      return
    }
    required++
    if (isItemFilled(session, key)) {
      filled++
    }
  })

  if (filled === 0) {
    return 'not-started'
  }
  if (filled < required) {
    return 'in-progress'
  }
  return 'completed'
})

