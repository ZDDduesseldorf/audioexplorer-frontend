// clusters.ts — 43 رنگ متمایز برای 43 category

export const CLUSTER_COLORS: readonly string[] = [
    "#e74c3c", // Ah sound
    "#3498db", // Animal Imitation
    "#2ecc71", // Argh Sound
    "#f39c12", // Burping
    "#9b59b6", // Coo/Babble
    "#1abc9c", // Cough
    "#e91e63", // Crying
    "#ff5722", // Eating/Oral
    "#607d8b", // Effort/Pain
    "#8bc34a", // Exhalating
    "#00bcd4", // Gasp
    "#ff9800", // Groaning
    "#673ab7", // Grunting
    "#f06292", // Hissing
    "#ffeb3b", // Laughter
    "#26c6da", // Lip Smacking
    "#ef5350", // Mm/hm sound
    "#ab47bc", // Moaning
    "#66bb6a", // Nah Burst
    "#ffa726", // Oh sound
    "#29b6f6", // Other
    "#ec407a", // Scream
    "#d4e157", // Scream/Shout
    "#26a69a", // Shout
    "#7e57c2", // Shushing
    "#ff7043", // Sigh
    "#42a5f5", // Sneeze
    "#9ccc65", // Sniff
    "#ffca28", // Snore
    "#26c6da", // Squeal
    "#5c6bc0", // Throat Clearing
    "#e53935", // Tongue Click
    "#00e676", // Trill
    "#ff4081", // Tsk-Tsk
    "#40c4ff", // Um sound
    "#b2ff59", // Vowel Burst
    "#ff6d00", // Wheezing
    "#e040fb", // Whine
    "#64ffda", // Whistle
    "#ffd740", // Wo Sound
    "#69f0ae", // Yawn
    "#80d8ff", // Yawn/Snore
    "#ffffff", // Unknown
];

export function getClusterColor(cluster: number): string {
    return CLUSTER_COLORS[cluster % CLUSTER_COLORS.length] ?? "#ffffff";
}

