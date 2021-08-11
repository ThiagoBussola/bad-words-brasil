import badWords from './badWords'

function preventableWord (word) {
  const revisedString = reviewFullString(word)

  for (const phrase of revisedString) {
    const teste = badWords.includes(phrase)
    if (teste) return true
  }
  return false
}

function reviewFullString (phrase) {
  if (!phrase) {
    return ''
  }
  const lowerCasePhrase = phrase.toLowerCase()

  const wordArr = lowerCasePhrase.split(' ')

  return wordArr
}

export {
  preventableWord
}
