import { Howl } from "howler";

// stores current active howler sound 
let currentSound: Howl | null = null;

export function playAudioByUuid(uuid: string) {
  // stop previous sound before playing a new one
  if (currentSound) {
    currentSound.stop();
    currentSound.unload();
  }

  // creates new howler instance for selected audio file
  currentSound = new Howl({
    src: [`/api/v1/sounds/audio/${uuid}`],
    html5: true,
    onloaderror: (_soundId, error) => {
      console.error("Audio could not be loaded", error);
    },
    onplayerror: (_soundId, error) => {
      console.error("Audio could not be played", error);
    },
  });

  // start playback
  currentSound.play();
}

// stops current playing audio
export function stopAudio() {
  if (!currentSound) return;

  currentSound.stop();
  currentSound.unload();
  currentSound = null;
}