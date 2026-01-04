import './index.css'

import {createRoot} from 'react-dom/client'

import {App} from './components/App'
// import reportWebVitals from './reportWebVitals'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <App persistEnabled={false} reduxLoggerEnabled />,
  // </StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log)
