import React from "react";

const ViewTaskModal = ({
  event,
  isTeacherUser,
  isVerified,
  onBackdropClick,
  onClose,
  onEdit,
  onDelete
}) => {
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
              <h5 className="modal-title">{event.title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>
                <strong>날짜:</strong>{" "}
                {new Date(event.start).toLocaleDateString("ko-KR")}
              </p>
              {event.subject && (
                <p>
                  <strong>과목:</strong> {event.subject}
                </p>
              )}
              {event.description && (
                <div>
                  <strong>설명:</strong>
                  <p>{event.description}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {isTeacherUser && isVerified && (
                <>
                  <button
                    className="btn btn-danger me-auto"
                    onClick={onDelete}
                  >
                    삭제
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={onEdit}
                  >
                    수정
                  </button>
                </>
              )}
              {isTeacherUser && !isVerified && (
                <div className="text-warning me-auto">
                  <small>계정 검증 후에 일정 관리가 가능합니다.</small>
                </div>
              )}
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

export default ViewTaskModal;