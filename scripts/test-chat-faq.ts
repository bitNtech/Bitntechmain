import assert from 'node:assert'
import { matchFaq } from '../src/components/chat/chatFaq.ts'

assert.equal(matchFaq('hello there').mood, 'happy')
assert.match(matchFaq('how much does it cost?').answer, /pricing|quote/i)
assert.match(matchFaq('how do I contact you').answer, /care@bitntech\.ai/)
assert.equal(matchFaq('asdkfjasldkfj').answer, matchFaq('zzz').answer) // unmatched input falls back consistently

console.log('chatFaq: all assertions passed')
