import React from "react";

const DateTasksModal = ({
  selectedDate,
  tasksForDate,
  isTeacherUser,
  isVerified,
  onBackdropClick,
  onClose,
  onViewTask,
  onAddTask,
}) => {
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("ko-KR")
    : "";

  return (
    <div className="modal-overlay" onClick={onBackdropClick}>
      <div
        className="modal-backdrop fade show"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1040,
        }}
      ></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{formattedDate} 일정</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {tasksForDate && tasksForDate.length > 0 ? (
                <div>
                  <h6>이날의 일정:</h6>
                  <ul className="list-group">
                    {tasksForDate.map((task) => (
                      <li
                        key={task.id}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={() => onViewTask(task)}
                        style={{ cursor: "pointer" }}
                      >
                        <div>
                          <strong>{task.title}</strong>
                          {task.subject && (
                            <span className="badge bg-info ms-2">
                              {task.subject}
                            </span>
                          )}
                        </div>
                        <i className="bi bi-chevron-right"></i>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-center">이날의 일정이 없습니다.</p>
              )}
            </div>
            <div className="modal-footer">
              {isTeacherUser && isVerified ? (
                <button className="btn btn-primary me-auto" onClick={onAddTask}>
                  이날 일정 추가
                </button>
              ) : isTeacherUser && !isVerified ? (
                <div className="text-warning me-auto">
                  <small>관리자 승인 후에 일정 추가가 가능합니다.</small>
                </div>
              ) : null}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTasksModal;
