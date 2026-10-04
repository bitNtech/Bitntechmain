// Run: node --experimental-strip-types src/pages/cardEnquiry.test.ts
// The enquiry form never reaches a server, so these rules and this message are
// the whole of what BitNTech receives. Guards both, plus the WhatsApp link.
import assert from 'node:assert/strict'
import { EMPTY, enquiryText, validate } from './cardEnquiry.ts'
import { whatsappHref } from '../contact.ts'

// Empty form: every required field complains, optional ones do not.
assert.deepEqual(Object.keys(validate(EMPTY)).sort(), ['consent', 'customization', 'email', 'name', 'phone', 'quantity'])

const ok = {
  ...EMPTY,
  name: ' Asha Rao ',
  email: 'asha@example.com',
  phone: '+91 98765-43210',
  quantity: '25',
  customization: 'Business',
  consent: true,
}
assert.deepEqual(validate(ok), {})

assert.ok(validate({ ...ok, email: 'asha@example' }).email)
assert.ok(validate({ ...ok, phone: '12345' }).phone)
assert.ok(validate({ ...ok, phone: '98765abc10' }).phone)
assert.ok(validate({ ...ok, quantity: '0' }).quantity)
assert.ok(validate({ ...ok, quantity: '2.5' }).quantity)
assert.ok(validate({ ...ok, quantity: '' }).quantity)

// Message: trimmed values, blank optional fields left out entirely.
const text = enquiryText(ok)
assert.match(text, /\n\nName: Asha Rao\n/)
assert.match(text, /Quantity: 25\nCustomization: Business$/)
assert.ok(!text.includes('Company:'))
assert.match(enquiryText({ ...ok, company: 'Rao & Co' }), /Company: Rao & Co/)

// The link must survive &, # and newlines intact.
const href = whatsappHref(enquiryText({ ...ok, company: 'Rao & Co #1' }))
assert.match(href, /^https:\/\/wa\.me\/\d+\?text=/)
assert.equal(new URL(href).searchParams.get('text'),enquiryText({ ...ok, company: 'Rao & Co #1' }))

console.log('cardEnquiry: ok')
