import { Gauge, Metric, levelTone } from '../ui'

export function StudentView({ data, admin = false }) {
  const { profile, academics: a, readiness: r } = data
  const first = profile.fullName.split(' ')[0]
  return (
    <>
      <div className="welcome">
        {admin ? <p className="muted">Student profile</p> : <p className="muted">✦ Welcome back</p>}
        <h1>{admin ? profile.fullName : `Hi, ${first}`}</h1>
        <p className="muted">
          {admin ? `${profile.email}${profile.branch ? ` · ${profile.branch}` : ''} · ` : 'You are '}
          <b>{r.level}</b> with a readiness score of {r.score}%.
        </p>
      </div>
      <div className="grid3">
        <section className="card" style={{ display: 'grid', justifyItems: 'center', alignContent: 'start' }}>
          <h2 style={{ justifySelf: 'start' }}>Placement readiness</h2>
          <Gauge value={r.score} label="Readiness" />
          <span className={`status ${levelTone(r.level)}`}>{r.level}</span>
        </section>
        <section className="card">
          <h2>Core competencies</h2>
          <Metric label="Academic (CGPA)" value={Math.round(a.cgpa * 10)} note={`CGPA ${a.cgpa} / 10`} />
          <Metric label="Aptitude" value={a.aptitudeScore} />
          <Metric label="Coding" value={a.codingScore} />
          <Metric label="Communication" value={a.communicationScore} />
        </section>
        <section className="card">
          <h2>Top career matches</h2>
          {r.recommendedCareers.map((c, i) => <div className="career" key={c}><i>{i + 1}</i>{c}</div>)}
          <h2 style={{ marginTop: 18 }}>Skills to build</h2>
          <p>{r.recommendedSkills.map((s) => <span className="chip" key={s}>{s}</span>)}</p>
          <h2 style={{ marginTop: 12 }}>Current skills</h2>
          <p>{a.skills.map((s) => <span className="chip" key={s}>{s}</span>)}</p>
        </section>
      </div>
    </>
  )
}
