import {Link} from 'react-router-dom'

export const RootScreen = () => {
  return (
    <div className="screen">
      <Link className={'link'} to={'/users'}>
        Redux: Normalized
      </Link>
      <Link className={'link'} to={'/mutable/users'}>
        Redux: Normalized, mutable collections
      </Link>
      <Link className={'link'} to={'/not-normalized/users'}>
        Redux: Not normalized (invalidation)
      </Link>
      <Link className={'link'} to={'/not-normalized-optimized/users'}>
        Redux: Not normalized, optimized (better state updates)
      </Link>
      <Link className={'link'} to={'/zustand/users'}>
        Zustand: Normalized
      </Link>
    </div>
  )
}
