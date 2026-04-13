import { Navigate } from 'react-router-dom'

function ProtectedAdminRoute({ isAdmin, children }) {
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedAdminRoute
