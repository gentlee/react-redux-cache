import {Link} from 'react-router-dom'

export const RootScreen = () => {
  return (
    <div className="screen">
      <Link className={'link'} to={'/users'}>
        [Good] Normalized example
      </Link>
      <Link className={'link'} to={'/not-normalized/users'}>
        [Bad] Not normalized example (cache-policy: 'cache-and-fetch')
      </Link>
      <Link className={'link'} to={'/not-normalized-optimized/users'}>
        [Normal] Not normalized, optimized example (default cache-policy: 'cache-first')
      </Link>
    </div>
  )
}
