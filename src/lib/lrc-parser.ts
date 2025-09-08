export interface LrcLine {
  time: number;
  text: string;
}

export interface ParsedLrc {
  title?: string;
  artist?: string;
  album?: string;
  offset?: number;
  lines: LrcLine[];
}

/**
 * Convierte tiempo en formato MM:SS.XX a segundos
 */
function timeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  
  const minutes = parseInt(parts[0], 10);
  const seconds = parseFloat(parts[1]);
  
  return minutes * 60 + seconds;
}

/**
 * Parser para archivos LRC (LyRiCs)
 */
export function parseLrc(lrcContent: string): ParsedLrc {
  const lines = lrcContent.split('\n');
  const result: ParsedLrc = {
    lines: []
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Detectar metadatos
    const metaMatch = trimmedLine.match(/^\[(\w+):(.*)\]$/);
    if (metaMatch) {
      const [, key, value] = metaMatch;
      switch (key.toLowerCase()) {
        case 'ti':
          result.title = value;
          break;
        case 'ar':
          result.artist = value;
          break;
        case 'al':
          result.album = value;
          break;
        case 'offset':
          result.offset = parseInt(value, 10);
          break;
      }
      continue;
    }

    // Detectar líneas de tiempo con letras
    const timeMatches = trimmedLine.match(/\[(\d{2}:\d{2}\.?\d*)\]/g);
    if (timeMatches) {
      const text = trimmedLine.replace(/\[\d{2}:\d{2}\.?\d*\]/g, '').trim();
      
      for (const timeMatch of timeMatches) {
        const timeStr = timeMatch.slice(1, -1); // Remover corchetes
        const time = timeToSeconds(timeStr);
        
        if (!isNaN(time)) {
          result.lines.push({ time, text });
        }
      }
    }
  }

  // Ordenar líneas por tiempo
  result.lines.sort((a, b) => a.time - b.time);

  return result;
}

/**
 * Encuentra la línea activa basada en el tiempo actual
 */
export function getCurrentLine(lines: LrcLine[], currentTime: number): {
  currentLine: LrcLine | null;
  currentIndex: number;
  nextLine: LrcLine | null;
} {
  let currentIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (currentTime >= lines[i].time) {
      currentIndex = i;
    } else {
      break;
    }
  }

  return {
    currentLine: currentIndex >= 0 ? lines[currentIndex] : null,
    currentIndex,
    nextLine: currentIndex + 1 < lines.length ? lines[currentIndex + 1] : null
  };
}

/**
 * Calcula el progreso de la línea actual (0-1)
 */
export function getCurrentLineProgress(
  currentLine: LrcLine | null,
  nextLine: LrcLine | null,
  currentTime: number
): number {
  if (!currentLine || !nextLine) return 0;
  
  const duration = nextLine.time - currentLine.time;
  const elapsed = currentTime - currentLine.time;
  
  return Math.min(Math.max(elapsed / duration, 0), 1);
}