import './PageHeader.css'

export default function PageHeader({ title }) {
  return (
    <div className="page-header">
      <div className="page-header__inner">
        <h1 className="page-header__title">{title}</h1>
      </div>
    </div>
  )
}
