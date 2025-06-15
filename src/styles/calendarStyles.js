export const calendarStyles = `
  .fc-event {
    cursor: pointer;
  }
  .fc-day-today {
    background-color: rgba(255, 220, 40, 0.15) !important;
  }
  .fc-daygrid-day:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  /* Make the toolbar layout more balanced */
  .fc-header-toolbar {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  
  /* Give equal space to each section */
  .fc-toolbar-chunk {
    flex: 1 !important;
    display: flex !important;
  }
  
  /* Align the buttons to their respective sides */
  .fc-toolbar-chunk:first-child {
    justify-content: flex-start !important;
  }
  
  .fc-toolbar-chunk:nth-child(2) {
    justify-content: center !important;
  }
  
  .fc-toolbar-chunk:last-child {
    justify-content: flex-end !important;
  }
  
  /* Make the title text centered */
  .fc .fc-toolbar-title {
    width: 100% !important;
    text-align: center !important; 
    font-weight: 500 !important;
  }
  
  /* Loading indicator for month navigation */
  .calendar-loading {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.8);
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 5;
  }
`;