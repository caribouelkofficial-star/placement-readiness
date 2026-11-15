import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Logo, ThemeToggle, Icon, Footer } from '../ui'
import Hero from './Hero'
import AuthModal from './AuthModal'

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
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const initial = params.get('auth')
  const [auth, setAuth] = useState(initial === 'signup' || initial === 'login' ? initial : null)
  const openAuth = (m) => setAuth(m)
  const closeAuth = useCallback(() => { setAuth(null); if (params.get('auth')) navigate('/', { replace: true }) }, [params, navigate])
  useEffect(() => { document.title = 'PlaceReady: Know your potential. Get placement ready.' }, [])
  return (
    <div className="land" id="top">
      <div className="wrap">
        <header className="nav">
          <Link to="/" aria-label="PlaceReady home"><Logo /></Link>
          <div className="right">
            <ThemeToggle />
            <button type="button" className="btn hide-s" onClick={() => openAuth('login')}>Log in</button>
            <button type="button" className="btn primary" onClick={() => openAuth('signup')}>Get started</button>
          </div>
        </header>
        <main>
          <Hero onSignup={() => openAuth('signup')} onLogin={() => openAuth('login')} />

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
            <button type="button" className="btn primary lg" onClick={() => openAuth('signup')}>Create my account<Icon name="arrow" size={16} /></button>
          </section>
        </main>
      </div>
      <Footer full onAuth={openAuth} />
      {auth && <AuthModal mode={auth} onMode={setAuth} onClose={closeAuth} />}
    </div>
  )
}
