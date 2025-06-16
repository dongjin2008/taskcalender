import React from "react";

export function Notifications({ error, notification, setError, setNotification }) {
  return (
    <>
      {/* Error alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {/* Notification alert */}
      {notification?.show && ( // Make sure to check notification.show
        <div 
          className={`alert alert-${notification.type || 'info'} alert-dismissible fade show`} 
          role="alert"
        >
          {notification.message} {/* Access the message property */}
          <button
            type="button"
            className="btn-close"
            onClick={() => setNotification({...notification, show: false})}
            aria-label="Close"
          ></button>
        </div>
      )}
    </>
  );
}