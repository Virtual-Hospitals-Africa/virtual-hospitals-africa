from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch
import torchaudio



# Load the model and processor
model_name = "/Users/willweiss/dev/morehumaninternet/whisper-small-sesotho"  # or local path "."
processor = WhisperProcessor.from_pretrained(model_name)
model = WhisperForConditionalGeneration.from_pretrained(model_name)

# Load and process audio
audio_path = "/Users/willweiss/Downloads/st_za/za/sso/wavs/sso_1801_6615789754.wav"
waveform, sample_rate = torchaudio.load(audio_path)

# Resample to 16kHz if needed (Whisper expects 16kHz)
if sample_rate != 16000:
    resampler = torchaudio.transforms.Resample(sample_rate, 16000)
    waveform = resampler(waveform)

# Process audio
input_features = processor(waveform.squeeze().numpy(), sampling_rate=16000, return_tensors="pt").input_features

# Generate transcription
with torch.no_grad():
    predicted_ids = model.generate(input_features)

# Decode the transcription
transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)

print(transcription[0])

