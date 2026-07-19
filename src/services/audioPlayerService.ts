// stores current sudio
const audioPlayer = new Audio();

// builds backend for selected audio file
export function getAudioByUuid(uuid: string): string {
  return `/api/v1/sounds/audio/${uuid}`;
}

// makes the audio player available to WaveSurfer.
export function getAudioPlayer(): HTMLAudioElement {
  return audioPlayer;
}

//starts audioplayback
export function playAudioByUuid(uuid: string): void {
  stopAudio();

  audioPlayer.src = getAudioByUuid(uuid);

  // handles errors
  void audioPlayer.play().catch((error: unknown) => {
    console.error("Audio could not be played", error);
  });
}

//stops current active audio and resets to beginning
export function stopAudio(): void {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
}
