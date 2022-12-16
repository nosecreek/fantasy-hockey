const Footer = ({ setHelpScreen }) => {
  const displayHelp = (e) => {
    e.preventDefault()
    setHelpScreen(true)
  }

  return (
    <div className="footer">
      <a href="/" onClick={(e) => displayHelp(e)}>
        Help
      </a>{' '}
      | <a href="/auth/logout">Logout</a>
    </div>
  )
}

export default Footer
