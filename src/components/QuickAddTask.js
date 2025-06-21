import React, { useState } from "react";

const QuickAddTask = ({ classOptions, onQuickAdd, selectedClass, tooltip }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [subject, setSubject] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create minimal task with essential details
    const quickTask = {
      title,
      date,
      subject: subject || "",
      // By default select the currently viewed class
      class: [selectedClass || classOptions[0].id],
      description: "",
    };

    // Call the provided callback to add the task
    onQuickAdd(e, quickTask);

    // Reset form
    setTitle("");
    setSubject("");
    resetDateToToday();

    // Optionally collapse the form after submission
    setIsExpanded(false);
  };

  const resetDateToToday = () => {
    setDate(new Date().toISOString().split("T")[0]);
  };

  // If not expanded, show just the quick add button
  if (!isExpanded) {
    return (
      <div className="quick-add-task">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => setIsExpanded(true)}
          title={tooltip || "빠른 일정 추가"}
        >
          <i className="bi bi-plus-lg me-1"></i> 빠른 추가
        </button>
      </div>
    );
  }

  // If expanded, show the mini form
  return (
    <div className="quick-add-task card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">빠른 일정 추가</h6>
          <button
            className="btn btn-sm btn-close"
            onClick={() => setIsExpanded(false)}
            aria-label="Close"
          ></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-2">
            <div className="col-12">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="제목 (예: 수학 숙제)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="col-6">
              <input
                type="date"
                className="form-control form-control-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="col-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="과목 (선택)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="col-12 mt-2 d-flex justify-content-between">
              <div>
                <small className="text-muted">
                  {selectedClass
                    ? `${selectedClass}반에 추가됩니다`
                    : "기본 반에 추가됩니다"}
                </small>
              </div>
              <div>
                <button type="submit" className="btn btn-sm btn-primary">
                  추가
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddTask;
