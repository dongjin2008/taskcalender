export function Notifications({ 
  error, 
  notification, 
  setError, 
  setNotification 
}) {
  return (
    <>
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {notification.show && (
        <div
          className={`alert alert-${notification.type} alert-dismissible fade show`}
          role="alert"
        >
          {notification.message}
          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setNotification({ show: false, message: "", type: "info" })
            }
            aria-label="Close"
          ></button>
        </div>
      )}
    </>
  );
}