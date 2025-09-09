from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch
import torchaudio
import sys
import os
import io
import tempfile

# Check for command line arguments
if len(sys.argv) != 2:
    print("Usage: python transcribe.py <path/to/model>")
    sys.exit(1)

model_name = sys.argv[1]

# Load model and processor
processor = WhisperProcessor.from_pretrained(model_name)
model = WhisperForConditionalGeneration.from_pretrained(model_name)

# audio_path = sys.stdin.buffer.read().strip()
audio_path="/Users/willweiss/Downloads/st_za/za/sso/wavs/sso_1367_7971611424.wav"

print(audio_path)

waveform, sample_rate = torchaudio.load(audio_path)

# Ensure we have audio data
if waveform.size(0) == 0:
    print("No audio data found", file=sys.stderr)
    sys.exit(1)

# Resample to 16kHz if needed (Whisper expects 16kHz)
if sample_rate != 16000:
    resampler = torchaudio.transforms.Resample(sample_rate, 16000)
    waveform = resampler(waveform)

# Convert to mono if stereo
if waveform.size(0) > 1:
    waveform = waveform.mean(dim=0, keepdim=True)

# Process audio
try:
    input_features = processor(
        waveform.squeeze().numpy(), 
        sampling_rate=16000, 
        return_tensors="pt"
    ).input_features

    # Generate transcription
    with torch.no_grad():
        predicted_ids = model.generate(input_features)

    # Decode the transcription
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)

    # Output the transcription
    print(transcription[0])

except Exception as e:
    print(f"Error during transcription: {e}", file=sys.stderr)
    sys.exit(1)
