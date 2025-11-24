export default function Card({ children, className = "" }) {
  return (
    <div className={`card-premium ${className}`}>
      {children}
    </div>
  )
}

