import api from './api';

export async function transcribeAudio(blob, language = 'hi') {
  const form = new FormData();
  form.append('audio', blob, 'aether-voice.webm');
  form.append('language', language);

  const response = await api.post('/voice/transcribe', form, {
    timeout: 180000,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data?.success) {
    throw new Error(response.data?.detail || 'Voice transcription failed.');
  }

  return response.data;
}
