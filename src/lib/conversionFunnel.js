export const trackEvent = async (eventName, data) => {
  console.log(`Event tracked: ${eventName}`, data);
  return { success: true };
};
