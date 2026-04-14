function AdminDashboard({ crowdData, onSendAlert, isSendingAlert, alertStatus }) {
  return (
    <section className="admin-section" role="region" aria-label="Admin Dashboard">
      <h2>Admin Dashboard</h2>
      <p className="admin-subtitle">Live Crowd Data</p>

      <div className="admin-zones" role="list" aria-label="Crowd zone readings">
        <p role="listitem">Gate A: {crowdData.gateA ?? '-'}</p>
        <p role="listitem">Food Court: {crowdData.foodCourt ?? '-'}</p>
        <p role="listitem">Seating: {crowdData.seating ?? '-'}</p>
      </div>

      <button
        className="notify-btn"
        onClick={onSendAlert}
        disabled={isSendingAlert}
        aria-label={isSendingAlert ? 'Sending alert, please wait' : 'Send crowd alert to all users'}
        aria-busy={isSendingAlert}
      >
        {isSendingAlert ? 'Sending...' : 'Send Alert'}
      </button>

      {alertStatus && (
        <p className="admin-status" role="status" aria-live="polite">
          {alertStatus}
        </p>
      )}
    </section>
  )
}

export default AdminDashboard
