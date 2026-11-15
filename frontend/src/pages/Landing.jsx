import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Logo, ThemeToggle, Gauge, Metric, Icon, Footer } from '../ui'

const features = [
  ['readiness', 'Transparent readiness score', 'One 0–100 score built from CGPA, aptitude, coding and communication, with the weights shown.'],
  ['skills', 'Skill recommendations', 'See which skills to work on next, based on where your scores are lowest.'],
  ['careers', 'Career suggestions', 'Roles that fit your strengths, such as Software Engineer or Data Analyst.'],
  ['students', 'Placement-cell view', 'Officers see every student, their last login and their readiness in one table.'],
]
const steps = [
  ['Create your account', 'Sign up as a student with your name, phone number and email. It takes under a minute.'],
  ['See your readiness', 'Your dashboard shows your score, your strongest areas and the roles that fit you best.'],
  ['Close the gaps', 'Follow the skill gap analysis and the 90-day roadmap to improve week by week.'],
]

export default function Landing() {
  useEffect(() => { document.title = 'PlaceReady: Know your potential. Get placement ready.' }, [])
  return (
    <div className="land" id="top">
      <div className="wrap">
        <header className="nav">
          <Link to="/" aria-label="PlaceReady home"><Logo /></Link>
          <div className="right">
            <ThemeToggle />
            <Link className="btn hide-s" to="/login">Log in</Link>
            <Link className="btn primary" to="/login?mode=signup">Get started</Link>
          </div>
        </header>
        <main>
          <section className="hero">
            <div>
              <span className="badge"><Icon name="spark" size={14} />Skill-based career guidance</span>
              <h1>Know your potential.<br /><span className="grad">Get placement ready.</span></h1>
              <p className="lead">PlaceReady measures your readiness across academics, aptitude, coding and communication, then points you to the skills and roles to focus on.</p>
              <div className="cta">
                <Link className="btn primary lg" to="/login?mode=signup">Check my readiness<Icon name="arrow" size={16} /></Link>
                <a className="btn lg" href="#features">Explore features</a>
              </div>
              <div className="checks"><span>Transparent scoring</span><span>Role-based access</span><span>No paid AI APIs</span></div>
            </div>
            <div className="card preview" aria-label="Sample dashboard preview">
              <Gauge value={72} label="Readiness" />
              <div>
                <h2>Category scores</h2>
                <Metric label="Aptitude" value={66} /><Metric label="Coding" value={71} /><Metric label="Communication" value={78} />
                <p className="muted note">Sample numbers for illustration.</p>
              </div>
            </div>
          </section>

          <section className="section" id="features">
            <div className="section-head"><h2>Everything you need to prepare with confidence</h2><p>Clear numbers, clear next steps, and one place for students and the placement cell.</p></div>
            <div className="feat">
              {features.map(([i, t, d]) => <div className="card" key={t}><div className="ico"><Icon name={i} size={20} /></div><h3>{t}</h3><p>{d}</p></div>)}
            </div>
          </section>

          <section className="section" id="how">
            <div className="section-head"><h2>How it works</h2><p>Three steps from sign-up to a plan you can follow.</p></div>
            <div className="steps">
              {steps.map(([t, d]) => <div className="card step" key={t}><h3>{t}</h3><p>{d}</p></div>)}
            </div>
          </section>

          <section className="band">
            <h2>Ready to see where you stand?</h2>
            <p>Create a free student account and get your readiness score right away.</p>
            <Link className="btn primary lg" to="/login?mode=signup">Create my account<Icon name="arrow" size={16} /></Link>
          </section>
        </main>
      </div>
      <Footer full />
    </div>
  )
}
