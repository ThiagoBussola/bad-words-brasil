import * as fs from 'fs';
import * as path from 'path';

const badWords = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'src/badWords.json'), {encoding: 'utf-8'}))

function preventableWord (word) {
  if(!(typeof word === "string" || word instanceof String)) throw "É necessário que o parametro seja um String"
  if((word.length < 1)) return false;
  
  const revisedString = reviewFullString(word)
  for (const phrase of revisedString) {
    if(phrase.length < 2) continue;

    if(badWords.words.indexOf(phrase) > -1) return true;
  }
  return false
}

function reviewFullString (phrase) {
  
  const lowerCasePhrase = phrase.toLowerCase()

  const wordArr = lowerCasePhrase.trim().split(/\s+/)

  return wordArr
}

export {
  preventableWord
}
