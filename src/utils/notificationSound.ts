// Generates a pleasant notification chime using Web Audio API
export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTime);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
      
      oscillator.start(audioCtx.currentTime + startTime);
      oscillator.stop(audioCtx.currentTime + startTime + duration);
    };

    // Two-tone chime: C5 → E5
    playTone(523.25, 0, 0.15);
    playTone(659.25, 0.12, 0.25);
  } catch (e) {
    // Audio not supported or blocked — fail silently
  }
}

export function requestBrowserNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function showBrowserNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "group-chat-invite",
    });
  }
}
