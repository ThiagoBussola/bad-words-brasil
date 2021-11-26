const badWords = require('./badWords.json').words

function preventableWord (word) {
  if(!(typeof word === 'string' || word instanceof String)) throw 'É necessário que o parametro seja um String'
  
  const revisedString = reviewFullString(word)

  for (const phrase of revisedString) {
    if(phrase.length < 2) continue;
    if(badWords.indexOf(value) > -1) return true;
  }
  return false
}

function reviewFullString (phrase) {
  if (!phrase) {
    return ''
  }
  const lowerCasePhrase = phrase.toLowerCase()

  const wordArr = lowerCasePhrase.trim().split(/\s+/)

  return wordArr
}

export {
  preventableWord
}
