import React, { useState, useEffect } from "react";

const TaskTemplates = ({ onUseTemplate, tooltip }) => {
  const [templates, setTemplates] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);

  // Load templates from localStorage
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const savedTemplates = localStorage.getItem("taskTemplates");
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (error) {
        console.error("Error loading templates:", error);
        setTemplates([]);
      }
    }
  };

  const handleUseTemplate = (template) => {
    onUseTemplate({
      ...template,
      date: new Date().toISOString().split("T")[0], // Update to today's date
    });
    setIsExpanded(false);
  };

  const handleDeleteTemplate = (index) => {
    // Create a new array without the deleted template
    const updatedTemplates = [
      ...templates.slice(0, index),
      ...templates.slice(index + 1),
    ];

    // Update state
    setTemplates(updatedTemplates);

    // Save to localStorage
    localStorage.setItem("taskTemplates", JSON.stringify(updatedTemplates));
  };

  if (!isExpanded) {
    return (
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => setIsExpanded(true)}
        title={tooltip || "저장된 템플릿 사용"}
      >
        <i className="bi bi-bookmark me-1"></i> 템플릿 활용
      </button>
    );
  }

  return (
    <div className="task-templates card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center py-2">
        <h6 className="mb-0">저장된 템플릿</h6>
        <div>
          {templates.length > 0 && (
            <button
              className={`btn btn-sm me-2 ${
                isManageMode ? "btn-secondary" : "btn-outline-secondary"
              }`}
              onClick={() => setIsManageMode(!isManageMode)}
              title={isManageMode ? "관리 모드 종료" : "템플릿 관리"}
            >
              <i className="bi bi-gear-fill"></i>
            </button>
          )}
          <button
            className="btn btn-sm btn-close"
            onClick={() => {
              setIsExpanded(false);
              setIsManageMode(false);
            }}
            aria-label="Close"
          ></button>
        </div>
      </div>
      <div className="card-body p-0">
        {templates.length === 0 ? (
          <div className="p-3 text-center text-muted">
            <i className="bi bi-bookmark-plus"></i>
            <p className="mb-0">
              일정을 추가할 때 템플릿으로 저장하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {templates.map((template, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold">{template.title}</div>
                  <small>
                    {template.subject && (
                      <span className="badge bg-secondary me-1">
                        {template.subject}
                      </span>
                    )}
                    {template.class?.length > 0 &&
                      template.class.map((cls) => (
                        <span key={cls} className="badge bg-info me-1">
                          {cls}반
                        </span>
                      ))}
                  </small>
                </div>
                {isManageMode ? (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteTemplate(index)}
                    title="템플릿 삭제"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleUseTemplate(template)}
                    title="템플릿 사용하기"
                  >
                    사용
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskTemplates;
