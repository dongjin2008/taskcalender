import React, { useState, useEffect } from "react";
import { googleCalendarSyncSettings } from "@/lib/googleCalendarSyncSettings";
import { googleCalendarService } from "@/lib/googleCalendarService";
import { taskSyncHelper } from "@/lib/taskSyncHelper";

const GoogleCalendarClassSelector = ({ classOptions }) => {
  const [syncClasses, setSyncClasses] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState(null);
  const [showSyncResults, setShowSyncResults] = useState(false);

  // Initialize state from local storage
  useEffect(() => {
    const storedClasses = googleCalendarSyncSettings.getSyncClasses();
    setSyncClasses(storedClasses);
    setIsConnected(googleCalendarService.isConnected());
  }, []);

  // Toggle class selection for syncing
  const handleToggleClass = async (classId) => {
    setIsSyncing(true);
    const isNowSynced = googleCalendarSyncSettings.toggleSyncClass(classId);

    // Update the state to reflect changes
    if (isNowSynced) {
      setSyncClasses((prev) => [...prev, classId]);

      try {
        // Sync existing tasks for the newly selected class
        const accessToken = googleCalendarService.getAccessToken();
        if (accessToken) {
          const results = await taskSyncHelper.syncExistingTasksForClass(
            classId,
            accessToken
          );
          setSyncResults(results);
          setShowSyncResults(true);

          // Hide results after 10 seconds
          setTimeout(() => {
            setShowSyncResults(false);
          }, 10000);
        }
      } catch (error) {
        console.error("Error syncing existing tasks:", error);
      }
    } else {
      // Remove the class from sync settings
      setSyncClasses((prev) => prev.filter((id) => id !== classId));

      // Ask if user wants to remove events for this class from Google Calendar
      if (
        confirm(
          `${classId} 반을 동기화에서 제외하시겠습니까? 구글 캘린더에서 이 반의 모든 일정을 삭제할까요?`
        )
      ) {
        try {
          const accessToken = googleCalendarService.getAccessToken();
          if (accessToken) {
            // Import dynamically to avoid circular dependencies
            const { googleCalendarUtils } = await import(
              "@/utils/googleCalendarUtils"
            );
            const { databases, AppwriteConfig } = await import(
              "@/lib/appwrite"
            );

            // Show syncing state
            setSyncResults({
              status: "cleaning",
              total: 0,
              synced: 0,
              skipped: 0,
              failed: 0,
              message: `구글 캘린더에서 ${classId} 반의 일정을 정리하는 중...`,
            });
            setShowSyncResults(true);

            // Clean up Google Calendar events for this class
            const results =
              await googleCalendarUtils.cleanupGoogleCalendarEventsForClass({
                classId,
                accessToken,
                databases,
                databaseId: AppwriteConfig.databaseId,
                collectionId: AppwriteConfig.calendarEventsCollectionId,
                onProgress: (progress) => {
                  setSyncResults({
                    status: progress.status,
                    total: progress.total || 0,
                    processed: progress.current || 0,
                    deleted: progress.results?.deleted || 0,
                    failed: progress.results?.failed || 0,
                    message: progress.message,
                  });
                },
              });

            // Show final results
            setSyncResults({
              total: results.total,
              synced: 0,
              deleted: results.deleted,
              failed: results.failed,
              skipped: results.notFound,
              message: `구글 캘린더에서 ${classId} 반의 ${results.deleted}개 일정이 삭제되었습니다.`,
            });

            // Hide results after 10 seconds
            setTimeout(() => {
              setShowSyncResults(false);
            }, 10000);
          }
        } catch (error) {
          console.error(
            `Error cleaning up Google Calendar events for class ${classId}:`,
            error
          );
          setSyncResults({
            status: "error",
            message: `오류 발생: ${error.message}`,
            failed: 1,
          });
        }
      }

      // Check if this was the last class being synced
      const updatedSyncClasses = syncClasses.filter((id) => id !== classId);
      if (updatedSyncClasses.length === 0) {
        // If no classes are selected for sync, ask the user if they want to remove any remaining events from Google Calendar
        if (
          confirm(
            "모든 반이 선택 해제되었습니다. 구글 캘린더에서도 다른 반의 남은 일정들을 삭제하시겠습니까?"
          )
        ) {
          try {
            const accessToken = googleCalendarService.getAccessToken();
            if (accessToken) {
              // Import dynamically to avoid circular dependencies
              const { googleCalendarUtils } = await import(
                "@/utils/googleCalendarUtils"
              );
              const { databases, AppwriteConfig } = await import(
                "@/lib/appwrite"
              );

              // Show syncing state
              setSyncResults({
                status: "cleaning",
                total: 0,
                synced: 0,
                skipped: 0,
                failed: 0,
                message: "구글 캘린더에서 일정을 정리하는 중...",
              });
              setShowSyncResults(true);

              // Clean up all Google Calendar events
              const results =
                await googleCalendarUtils.cleanupGoogleCalendarEvents({
                  accessToken,
                  databases,
                  databaseId: AppwriteConfig.databaseId,
                  collectionId: AppwriteConfig.calendarEventsCollectionId,
                  onProgress: (progress) => {
                    setSyncResults({
                      status: progress.status,
                      total: progress.total || 0,
                      processed: progress.current || 0,
                      deleted: progress.results?.deleted || 0,
                      failed: progress.results?.failed || 0,
                      message: progress.message,
                    });
                  },
                });

              // Show final results
              setSyncResults({
                total: results.total,
                synced: 0,
                deleted: results.deleted,
                failed: results.failed,
                skipped: results.notFound,
                message: `구글 캘린더에서 ${results.deleted}개 일정이 삭제되었습니다.`,
              });

              // Hide results after 10 seconds
              setTimeout(() => {
                setShowSyncResults(false);
              }, 10000);
            }
          } catch (error) {
            console.error("Error cleaning up Google Calendar events:", error);
            setSyncResults({
              status: "error",
              message: `오류 발생: ${error.message}`,
              failed: 1,
            });
          }
        }
      }
    }

    setIsSyncing(false);
  };

  // If not connected to Google Calendar, don't show the component
  if (!isConnected) {
    return null;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  const today = new Date();
  const formattedToday = `${today.getFullYear()}년 ${
    today.getMonth() + 1
  }월 ${today.getDate()}일`;

  return (
    <div className="google-calendar-sync-selector mt-3">
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <i className="bi bi-calendar-check text-success me-2"></i>
          <span>구글 캘린더 동기화 설정</span>
        </div>
        <div className="card-body">
          <p className="card-text">구글 캘린더에 동기화할 반을 선택하세요:</p>
          <div className="d-flex flex-wrap gap-2">
            {classOptions.map((classOption) => (
              <div key={classOption.id} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`sync-class-${classOption.id}`}
                  checked={syncClasses.includes(classOption.id)}
                  onChange={() => handleToggleClass(classOption.id)}
                  disabled={isSyncing}
                />
                <label
                  className="form-check-label"
                  htmlFor={`sync-class-${classOption.id}`}
                >
                  {classOption.name}
                </label>
              </div>
            ))}
          </div>

          {isSyncing && (
            <div className="alert alert-warning mt-3">
              <div className="d-flex align-items-center">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>기존 일정 동기화 중...</span>
              </div>
            </div>
          )}

          {showSyncResults && syncResults && (
            <div className="alert alert-success mt-3">
              <h6>동기화 결과:</h6>
              <ul className="mb-0">
                <li>총 일정: {syncResults.total}개</li>
                <li>동기화됨: {syncResults.synced}개</li>
                <li>건너뜀: {syncResults.skipped}개</li>
                <li>실패: {syncResults.failed}개</li>
              </ul>
              <p className="mt-2 mb-0">
                <small className="text-muted">
                  {formattedToday} 이후의 일정만 동기화되었습니다.
                </small>
              </p>
            </div>
          )}

          {syncClasses.length === 0 && (
            <div className="alert alert-warning mt-3 mb-0">
              <small>
                <i className="bi bi-info-circle me-1"></i>
                반을 선택하지 않으면 새로운 일정이 구글 캘린더에 동기화되지
                않습니다.
              </small>
            </div>
          )}

          <div className="alert alert-secondary mt-3 mb-0">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              반을 선택하면 <strong>{formattedToday} 이후</strong>의 기존 일정도
              자동으로 동기화됩니다.
            </small>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={async () => {
                try {
                  setIsSyncing(true);
                  const accessToken = googleCalendarService.getAccessToken();
                  if (accessToken) {
                    const results =
                      await taskSyncHelper.syncExistingTasksForSelectedClasses(
                        accessToken
                      );
                    setSyncResults(results.summary);
                    setShowSyncResults(true);

                    setTimeout(() => {
                      setShowSyncResults(false);
                    }, 10000);
                  }
                } catch (error) {
                  console.error("Error during manual sync:", error);
                } finally {
                  setIsSyncing(false);
                }
              }}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  동기화 중...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-repeat me-1"></i>
                  모든 일정 다시 동기화
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarClassSelector;
