export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Unknown";
  
  const date = new Date(timestamp);
  
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};