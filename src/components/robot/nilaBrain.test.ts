// Run: node src/components/robot/nilaBrain.test.ts
import assert from 'node:assert/strict'
import { besideBox, exampleFor, explainLine, firstSentence, idleEvent, perch, pickLine, rails, routeEvent } from './nilaBrain.ts'

const vp = { w: 1440, h: 900 }
const margin = 78

// Every route has to put her somewhere on screen, unknown ones included.
for (const path of ['/', '/about', '/contact', '/software', '/hardware', '/nowhere']) {
  const p = perch(path, vp)
  assert.ok(p.x >= margin && p.x <= vp.w - margin, `${path} x on screen`)
  assert.ok(p.y >= margin && p.y <= vp.h - margin, `${path} y on screen`)
}

assert.equal(routeEvent('/about'), 'route:/about')
assert.equal(routeEvent('/nope'), null)
assert.equal(idleEvent(3), 'nudge')

// She reads a card's own copy, so the line has to survive whatever is in it.
assert.equal(firstSentence('  One thing.  Two thing. '), 'One thing.')
assert.equal(firstSentence('No terminator here'), 'No terminator here')
assert.ok(firstSentence('word '.repeat(80)).length <= 121, 'long copy is cut')
assert.ok(firstSentence('word '.repeat(80)).endsWith('…'), 'a cut line says so')
// Two sentences where they fit, and only where they fit.
assert.equal(firstSentence('One. Two. Three.', 170, 2), 'One. Two.')
assert.equal(firstSentence('One. ' + 'x'.repeat(200) + '.', 40, 2), 'One.', 'a long second sentence is dropped, not truncated into the first')
assert.equal(firstSentence('No terminator', 170, 2), 'No terminator')

// A heading on its own says nothing you could not read yourself, so she has to
// put something concrete after it.
const ai = explainLine('Data & AI', 'We build models. And more.')!
assert.ok(ai.startsWith('Data & AI — We build models. And more.'), `lead reads from the card: ${ai}`)
assert.ok(ai.length > 'Data & AI — We build models. And more.'.length, 'an example has to follow')
assert.ok(exampleFor('AI Solutions'), 'the service headings all have an example')
assert.ok(exampleFor('Hardware')!.includes('sensor'), 'hardware gets a hardware example')
assert.equal(exampleFor('Zorblax'), null, 'nothing invented for a heading she cannot place')

// A card that lists its own specifics beats anything canned.
const listed = explainLine('Software', 'We build systems.', ['Web apps', 'Mobile apps', 'Internal tools'])!
assert.ok(listed.includes('For example: Web apps, Mobile apps, Internal tools.'), listed)
assert.ok(!listed.includes('think an internal dashboard'), 'the card wins over the canned example')

assert.ok(explainLine('Careers')?.includes('Careers'), 'a title alone still speaks')
assert.equal(explainLine('   '), null, 'an untitled box is not worth a line')

// Shaking her about has to have something to say, and it has to look dizzy.
assert.equal(pickLine('shaken').mood, 'dizzy')
assert.equal(pickLine('headrush').mood, 'dizzy')

// Never stand on top of the thing you are explaining.
const box = { left: 100, right: 500, top: 200, bottom: 400 }
const spot = besideBox(box, vp)
assert.equal(spot.x, vp.w - 78, 'takes the roomier side, out on its rail')
assert.equal(spot.y, 300)
// A box hard against the right edge pushes her to its left instead.
assert.equal(besideBox({ left: 1000, right: 1430, top: 100, bottom: 300 }, vp).x, 78)
// ...and she still never leaves the screen.
// She lives on one of exactly two lanes, whatever the box does.
for (const r of [{ left: 0, right: 200 }, { left: 700, right: 760 }, { left: -900, right: 3000 }]) {
  const lane = besideBox({ ...r, top: 100, bottom: 300 }, vp).x
  assert.ok(lane === 78 || lane === vp.w - 78, `must sit on a rail, got ${lane}`)
}
const edge = besideBox({ left: -50, right: 1490, top: -400, bottom: 2000 }, vp)
assert.ok(edge.x >= 78 && edge.x <= vp.w - 78 && edge.y >= 78 && edge.y <= vp.h - 78)

// Phones put a fixed tab bar along the bottom; she used to park behind it.
const phone = { w: 390, h: 844 }
const { side, floor } = rails(phone)
assert.ok(floor >= 96, 'the floor must clear the bottom tab bar')
assert.ok(side < 78 && side > 40, `side rails narrow with the screen, got ${side}`)
for (const path of ['/', '/about', '/contact', '/software', '/hardware']) {
  const p = perch(path, phone)
  assert.ok(p.y <= phone.h - floor, `${path} must sit above the tab bar`)
  assert.ok(p.x >= side && p.x <= phone.w - side, `${path} must stay on a phone-width rail`)
}
const low = besideBox({ left: 0, right: 390, top: 780, bottom: 900 }, phone)
assert.ok(low.y <= phone.h - floor, 'a box at the bottom still does not push her behind the tabs')

console.log('nilaBrain: ok')
