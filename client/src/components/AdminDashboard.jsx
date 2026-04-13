function AdminDashboard({ crowdData, onSendAlert, isSendingAlert, alertStatus }) {
  return (
    <section className="admin-section">
      <h2>Admin Dashboard</h2>
      <p className="admin-subtitle">Live Crowd Data</p>

      <div className="admin-zones">
        <p>Gate A: {crowdData.gateA ?? '-'}</p>
        <p>Food Court: {crowdData.foodCourt ?? '-'}</p>
        <p>Seating: {crowdData.seating ?? '-'}</p>
      </div>

      <button className="notify-btn" onClick={onSendAlert} disabled={isSendingAlert}>
        {isSendingAlert ? 'Sending...' : 'Send Alert'}
      </button>

      {alertStatus && <p className="admin-status">{alertStatus}</p>}
    </section>
  )
}

export default AdminDashboard
