import { Link } from 'react-router-dom'
import { Logo, ThemeToggle, Gauge, Metric } from '../ui'

const features = [
  ['◎', 'Transparent readiness score', 'One 0–100 score built from CGPA, aptitude, coding and communication, with the weights shown.'],
  ['⌗', 'Skill recommendations', 'See which skills to work on next, based on where your scores are lowest.'],
  ['➜', 'Career suggestions', 'Roles that fit your strengths, such as Software Engineer or Data Analyst.'],
  ['▦', 'Placement-cell view', 'Admins see every student, their last login and their readiness in one table.'],
]

export default function Landing() {
  return (
    <div className="land">
      <div className="wrap">
        <header className="nav">
          <Logo />
          <div className="right"><ThemeToggle /><Link className="btn" to="/login">Login</Link><Link className="btn primary" to="/login?mode=signup">Get Started</Link></div>
        </header>
        <section className="hero">
          <div>
            <span className="badge">✦ Skill-based career guidance</span>
            <h1>Know Your Potential.<br /><span className="grad">Get Placement Ready.</span></h1>
            <p className="lead">PlaceReady measures your readiness across academics, aptitude, coding and communication, then points you to the skills and roles to focus on.</p>
            <div className="cta"><Link className="btn primary" to="/login?mode=signup">Check My Readiness →</Link><a className="btn" href="#features">Explore Features</a></div>
            <div className="checks"><span>Transparent scoring</span><span>Role-based access</span><span>No paid AI APIs</span></div>
          </div>
          <div className="card preview">
            <Gauge value={72} label="Readiness" />
            <div style={{ flex: 1 }}>
              <h2>Category scores</h2>
              <Metric label="Aptitude" value={66} /><Metric label="Coding" value={71} /><Metric label="Communication" value={78} />
              <p className="muted" style={{ fontSize: 12 }}>Sample numbers for illustration.</p>
            </div>
          </div>
        </section>
        <section className="feat" id="features">
          {features.map(([i, t, d]) => <div className="card" key={t}><div className="ico">{i}</div><h3>{t}</h3><p>{d}</p></div>)}
        </section>
      </div>
    </div>
  )
}
