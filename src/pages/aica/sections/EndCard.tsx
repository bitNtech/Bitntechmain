import './EndCard.css'

/**
 * The page signs off the way the film does: its light end card — the mark,
 * the line, the address. It also gives the footer what it pours into on
 * bitntech.in: cream, not black, so the pink reads as liquid rising, not as
 * loose balls floating in the dark.
 */
export default function EndCard() {
  return (
    <section className="end paper" aria-label="AICA by BitNTech">
      <div className="end__rings" aria-hidden="true"><i /><i /><i /></div>
      <div className="wrap end__inner rise">
        <p className="end__mark display">AICA<em>.</em></p>
        <p className="end__line">Answer. Understand. Resolve. <b>24/7.</b></p>
        <p className="end__sub">AI voice agent for business calls in Tamil, English and Tanglish.</p>
        <p className="end__url">aica.bitntech.in <i>·</i> by BitN<em>Tech</em></p>
      </div>
    </section>
  )
}
