const Bar = ({ label, value }) => (
  <div className="metric">
    <span>{label}</span>
    <div className="track"><div className="fill" style={{ width: `${value}%` }} /></div>
    <b>{value}</b>
  </div>
)

export function StudentView({ data }) {
  const { profile, academics, readiness } = data
  return (
    <>
      <h1>{profile.fullName}</h1>
      <p className="muted">{profile.email}{profile.branch ? ` · ${profile.branch}` : ''}</p>
      <section className="card">
        <h2>Placement readiness</h2>
        <div className="score"><strong>{readiness.score}</strong><span className={`pill ${readiness.level.replace(/\s/g, '').toLowerCase()}`}>{readiness.level}</span></div>
        <h3>Recommended skills</h3>
        <p>{readiness.recommendedSkills.map((s) => <span className="chip" key={s}>{s}</span>)}</p>
        <h3>Career suggestions</h3>
        <p>{readiness.recommendedCareers.map((s) => <span className="chip" key={s}>{s}</span>)}</p>
      </section>
      <section className="card">
        <h2>Academics</h2>
        <p>CGPA: <b>{academics.cgpa}</b></p>
        <Bar label="Aptitude" value={academics.aptitudeScore} />
        <Bar label="Coding" value={academics.codingScore} />
        <Bar label="Communication" value={academics.communicationScore} />
        <p>{academics.skills.map((s) => <span className="chip" key={s}>{s}</span>)}</p>
      </section>
    </>
  )
}
