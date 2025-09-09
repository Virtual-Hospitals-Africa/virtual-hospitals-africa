from transformers import WhisperProcessor, WhisperForConditionalGeneration
import time
import torch
import torchaudio
import sys
import os
import io
import tempfile

def debug(line):
    print(line, file=sys.stderr)

def transcribe(processor, model, audio_path):
    waveform, sample_rate = torchaudio.load(audio_path)

    # Ensure we have audio data
    if waveform.size(0) == 0:
        raise Exception("No audio data found")

    # Resample to 16kHz if needed (Whisper expects 16kHz)
    if sample_rate != 16000:
        resampler = torchaudio.transforms.Resample(sample_rate, 16000)
        waveform = resampler(waveform)

    # Convert to mono if stereo
    if waveform.size(0) > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    # Process audio
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
    return transcription[0]

def main():
    if len(sys.argv) != 2:
        raise Exception("Usage: python transcribe.py <path/to/model>")

    model_name = sys.argv[1]
    debug(f"Process starting with model {model_name}")

    # # Load model and processor
    processor = WhisperProcessor.from_pretrained(model_name)
    debug(f"Processor loaded")

    model = WhisperForConditionalGeneration.from_pretrained(model_name)
    debug(f"Model loaded")

    debug("Awaiting audio path")
    audio_path = sys.stdin.buffer.read().strip()
    
    debug("Got audio path")
    start = time.process_time()

    transcription = transcribe(processor, model, audio_path)
    print(transcription)
    debug(time.process_time() - start)


if __name__ == "__main__":
    main()
