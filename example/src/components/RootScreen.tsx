import {Link} from 'react-router-dom'

export const RootScreen = () => {
  return (
    <div className="screen">
      <Link className={'link'} to={'/users'}>
        Normalized example
      </Link>
      <Link className={'link'} to={'/not-normalized/users'}>
        Not normalized example
      </Link>
    </div>
  )
}
