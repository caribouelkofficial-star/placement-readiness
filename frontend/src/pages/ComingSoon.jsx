import { useLocation, useNavigate } from 'react-router-dom'

export default function ComingSoon() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const feature = state?.feature
  return (
    <div className="soon card">
      <div className="soon-ico">🚧</div>
      <span className="status s-warn">In progress</span>
      <h1>Coming soon</h1>
      <p className="muted">{feature ? `${feature} is` : 'This feature is'} still being built and will be available in an upcoming release.</p>
      <button className="btn primary" onClick={() => navigate(-1)}>← Go back</button>
    </div>
  )
}
