let currentAudio: HTMLAudioElement | null = null;

// builds backend for selected audio file
export function getAudioByUuid(uuid: string) {
  return `/api/v1/sounds/audio/${uuid}`;
}

//plays audio for hover
export function playAudioByUuid(uuid: string) {
  stopAudio();

  currentAudio = new Audio(getAudioByUuid(uuid));

  currentAudio.play().catch((error) => {
    console.error("Audio could not be played", error);
  });
}

//stops current hover audio
export function stopAudio() {
  if (!currentAudio) return;

  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}
