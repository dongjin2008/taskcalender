"use client";

import AddTaskModal from "./modals/AddTaskModal";
import ViewTaskModal from "./modals/ViewTaskModal";
import EditTaskModal from "./modals/EditTaskModal";
import DateTasksModal from "./modals/DateTasksModal";

export function TaskModals({
  showModal,
  showEditModal,
  showViewModal,
  showDateModal,
  selectedEvent,
  selectedDate,
  newTask,
  editTask,
  tasksForDate,
  classOptions,
  isTeacherUser,
  isVerified,
  onBackdropClick,
  onCloseModal,
  onCloseEditModal,
  onCloseViewModal,
  onCloseDateModal,
  onViewTask,
  onEditClick,
  onAddTask,
  onDeleteEvent,
  onEditSubmit,
  onNewTaskChange,
  onEditTaskChange,
  onAddTaskForDate, // Add this
}) {
  return (
    <>
      {showModal && (
        <AddTaskModal
          newTask={newTask}
          classOptions={classOptions}
          onBackdropClick={onBackdropClick}
          onClose={onCloseModal}
          onSubmit={onAddTask}
          onChange={onNewTaskChange}
        />
      )}

      {showViewModal && selectedEvent && (
        <ViewTaskModal
          event={selectedEvent}
          isTeacherUser={isTeacherUser}
          isVerified={isVerified}
          onBackdropClick={onBackdropClick}
          onClose={onCloseViewModal}
          onEdit={onEditClick}
          onDelete={() => onDeleteEvent(selectedEvent.id)}
        />
      )}

      {showEditModal && (
        <EditTaskModal
          editTask={editTask}
          onBackdropClick={onBackdropClick}
          onClose={onCloseEditModal}
          onSubmit={onEditSubmit}
          onChange={onEditTaskChange}
        />
      )}

      {showDateModal && selectedDate && (
        <DateTasksModal
          selectedDate={selectedDate}
          tasksForDate={tasksForDate}
          isTeacherUser={isTeacherUser}
          isVerified={isVerified}
          onBackdropClick={onBackdropClick}
          onClose={onCloseDateModal}
          onViewTask={onViewTask}
          onAddTask={() => onAddTaskForDate(selectedDate)} // Use the new function
        />
      )}
    </>
  );
}
