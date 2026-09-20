const BRIEFING_GAP_MS = 420

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function stopSpeaking(): void {
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
}

export function speakLines(
  lines: readonly string[],
  onDone?: () => void,
): () => void {
  stopSpeaking()
  if (!canSpeak() || lines.length === 0) {
    onDone?.()
    return () => {}
  }

  let cancelled = false
  let index = 0
  let timer = 0

  const speakNext = () => {
    if (cancelled) return
    const line = lines[index]
    if (line == null) {
      onDone?.()
      return
    }
    const utter = new SpeechSynthesisUtterance(line)
    utter.rate = 0.92
    utter.pitch = 1.05
    utter.lang = 'en-US'
    const voices = window.speechSynthesis.getVoices()
    const preferred =
      voices.find((v) => /en[-_]US/i.test(v.lang) && /child|kid|samantha|google/i.test(v.name)) ??
      voices.find((v) => /en[-_]US/i.test(v.lang)) ??
      voices.find((v) => /^en/i.test(v.lang))
    if (preferred) utter.voice = preferred
    utter.onend = () => {
      index += 1
      timer = window.setTimeout(speakNext, BRIEFING_GAP_MS)
    }
    utter.onerror = () => {
      index += 1
      timer = window.setTimeout(speakNext, BRIEFING_GAP_MS)
    }
    window.speechSynthesis.speak(utter)
  }

  speakNext()

  return () => {
    cancelled = true
    window.clearTimeout(timer)
    stopSpeaking()
  }
}
