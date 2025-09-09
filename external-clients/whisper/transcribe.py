from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torch
import torchaudio
import sys
import os
import io
import tempfile

# Check for command line arguments
if len(sys.argv) != 3:
    print("Usage: python transcribe.py <path/to/model> <audio_file_or_dash>")
    sys.exit(1)

model_name = sys.argv[1]
audio_input = sys.argv[2]

# Load model and processor
processor = WhisperProcessor.from_pretrained(model_name)
model = WhisperForConditionalGeneration.from_pretrained(model_name)

# Handle audio input - either from file or stdin
if audio_input == '-':
    # Read from stdin
    try:
        # Read binary data from stdin
        audio_data = sys.stdin.buffer.read()
        
        if not audio_data:
            print("No audio data received from stdin", file=sys.stderr)
            sys.exit(1)
        
        # Create a temporary file to write the audio data
        # This is needed because torchaudio.load expects a file path or file-like object
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_audio_path = temp_file.name
        
        try:
            # Load audio from temporary file
            waveform, sample_rate = torchaudio.load(temp_audio_path)
        finally:
            # Clean up temporary file
            os.unlink(temp_audio_path)
            
    except Exception as e:
        print(f"Error reading audio from stdin: {e}", file=sys.stderr)
        sys.exit(1)
else:
    # Read from file
    try:
        waveform, sample_rate = torchaudio.load(audio_input)
    except Exception as e:
        print(f"Error loading audio file {audio_input}: {e}", file=sys.stderr)
        sys.exit(1)

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