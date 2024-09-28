import {Link} from 'react-router-dom'

export const RootScreen = () => {
  return (
    <div className="screen">
      <Link className={'link'} to={'/users'}>
        Normalized (best)
      </Link>
      <Link className={'link'} to={'/not-normalized/users'}>
        Not normalized (invalidation)
      </Link>
      <Link className={'link'} to={'/not-normalized-optimized/users'}>
        Not normalized, optimized (better state updates)
      </Link>
    </div>
  )
}
