// Exact regional match first; prefer Latin American voices for Peru and neighbours.
export function selectSpanishVoice(voices, region = 'es-PE') {
  const tag = voice => voice.lang.replaceAll('_', '-').toLowerCase();
  const spanish = voices.filter(voice => /^es(?:-|$)/.test(tag(voice)));
  return spanish.find(voice => tag(voice) === region.toLowerCase())
    || (region !== 'es-ES' && (spanish.find(voice => tag(voice) === 'es-419')
      || spanish.find(voice => !['es-es', 'es'].includes(tag(voice)))))
    || spanish[0];
}
