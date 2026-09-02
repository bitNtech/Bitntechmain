/**
 * Every contact detail the site shows, in one place. Four separate files used
 * to carry their own copy of the phone number, the email and the social URLs,
 * which is how three of them ended up on placeholder values.
 */
export const CONTACT = {
  phone: '+91 86102 37292',
  /* Dial strings have no spaces — a `tel:` with them is silently mis-parsed by
     some Android dialers. */
  phoneHref: 'tel:+918610237292',
  email: 'support@bitntech.in',
  emailHref: 'mailto:support@bitntech.in',
  instagram: { handle: '@bitntech.in', url: 'https://www.instagram.com/bitntech.in/' },
  linkedin: { handle: 'BitNTech', url: 'https://linkedin.com/company/bitntech' },
  github: { handle: 'BitNTech', url: 'https://github.com/BitNTechadmin' },
} as const
