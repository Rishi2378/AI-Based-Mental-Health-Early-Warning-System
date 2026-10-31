import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Play, Pause, RotateCcw, AlertCircle, CheckCircle2, Volume2, Sparkles, AudioWaveform } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Encodes Float32 PCM audio data into a standard 16-bit uncompressed WAV Blob.
 * Ensures 100% platform-independent audio processing without requiring ffmpeg.
 */
function encodeWAV(samples, sampleRate = 44100) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16-bit
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Synthesizes a clean speech-like acoustic harmonic wav for quick zero-mic instant testing.
 */
function generateDemoAudioClip() {
  const sampleRate = 22050;
  const durationSec = 3.0;
  const numSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Fundamental frequency ~ 150 Hz with harmonics mimicking voice cadence
    const f0 = 150 + Math.sin(2 * Math.PI * 1.5 * t) * 20;
    const voiceMod = Math.sin(2 * Math.PI * f0 * t) * 0.4
      + Math.sin(2 * Math.PI * f0 * 2 * t) * 0.25
      + Math.sin(2 * Math.PI * f0 * 3 * t) * 0.15;
    const envelope = Math.sin((Math.PI * t) / durationSec);
    samples[i] = voiceMod * envelope * 0.8;
  }

  return encodeWAV(samples, sampleRate);
}

const VoiceRecorder = ({ onAudioRecorded, isAnalyzing }) => {
  const { isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);

  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const pcmBuffersRef = useRef([]);
  const audioElementRef = useRef(null);

  useEffect(() => {
    drawIdleWaveform();
    return () => {
      cleanupAudio();
    };
  }, [isDark]);

  const drawIdleWaveform = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';

    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    for (let x = 0; x < width; x += 6) {
      const y = height / 2 + Math.sin(x * 0.05) * 4;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const cleanupAudio = () => {
    clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setFileName(null);
    setRecordingTime(0);
    setLiveVolume(0);
    pcmBuffersRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 22050 });
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const bufferSize = 4096;
      const scriptProcessor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        pcmBuffersRef.current.push(new Float32Array(inputData));

        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const volPct = Math.min(100, Math.round(rms * 400));
        setLiveVolume(volPct);
      };

      source.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioCtx.destination);

      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      visualizeRecording();
    } catch (err) {
      console.error(err);
      setErrorMsg("Microphone access denied or audio device not found. You can upload an audio file or click 'Quick Sample Clip'.");
    }
  };

  const visualizeRecording = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#06b6d4';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const stopRecording = () => {
    if (!isRecording) return;

    const sampleRate = audioCtxRef.current?.sampleRate || 22050;
    const chunks = pcmBuffersRef.current;
    let totalLength = 0;
    for (const chunk of chunks) totalLength += chunk.length;

    const mergedSamples = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      mergedSamples.set(chunk, offset);
      offset += chunk.length;
    }

    const wavBlob = encodeWAV(mergedSamples, sampleRate);

    cleanupAudio();
    setIsRecording(false);

    if (wavBlob.size < 1000 || totalLength < sampleRate * 0.5) {
      setErrorMsg("Recording was too short. Please speak clearly for at least 1-2 seconds.");
      drawIdleWaveform();
      return;
    }

    const url = URL.createObjectURL(wavBlob);
    setAudioBlob(wavBlob);
    setAudioUrl(url);
    setFileName(`microphone_recording_${Date.now().toString().slice(-4)}.wav`);

    if (onAudioRecorded) {
      onAudioRecorded(wavBlob);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio') && !file.name.match(/\.(wav|mp3|ogg|webm|m4a|flac)$/i)) {
      setErrorMsg("Please upload a valid audio file (.wav, .mp3, .ogg, .m4a).");
      return;
    }

    setErrorMsg(null);
    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);
    setFileName(file.name);
    if (onAudioRecorded) onAudioRecorded(file);
  };

  const handleLoadDemoClip = () => {
    setErrorMsg(null);
    const demoBlob = generateDemoAudioClip();
    const url = URL.createObjectURL(demoBlob);
    setAudioBlob(demoBlob);
    setAudioUrl(url);
    setFileName("synthesized_voice_sample.wav");
    if (onAudioRecorded) onAudioRecorded(demoBlob);
  };

  const handleTogglePlay = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    cleanupAudio();
    setIsRecording(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setFileName(null);
    setRecordingTime(0);
    setErrorMsg(null);
    setIsPlaying(false);
    drawIdleWaveform();
  };

  return (
    <div className="spatial-glass p-6 sm:p-7 rounded-3xl space-y-6 relative overflow-hidden transition-all border border-black/[0.06] dark:border-white/10">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-manrope text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Mic className="w-4 h-4" />
            </div>
            <span>Speech & Acoustic Voice Capture</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            Record voice directly in genuine 16-bit PCM WAV or upload an audio file to extract 38 acoustic signal parameters (pitch, energy, spectral roll-off).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleLoadDemoClip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full spatial-glass-subtle text-xs font-semibold text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 shadow-sm transition-all hover:scale-105 active:scale-95"
            title="Load ready-to-test speech sample"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>Sample Audio</span>
          </button>

          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            id="audio-upload-input"
          />
          <label
            htmlFor="audio-upload-input"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full spatial-glass-subtle text-xs font-semibold text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/10 cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-500" />
            <span>Upload File</span>
          </label>
        </div>
      </div>

      {/* Interactive Waveform Visualizer & Action Panel */}
      <div className="p-6 rounded-2xl spatial-glass-well flex flex-col items-center justify-center space-y-4 relative overflow-hidden transition-colors">
        <canvas
          ref={canvasRef}
          width={480}
          height={75}
          className="w-full h-20 rounded-xl bg-slate-950/80 dark:bg-black/60 border border-white/10 shadow-inner"
        />

        {isRecording ? (
          <div className="flex flex-col items-center space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-rose-500 font-mono text-sm px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/25">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>Recording Live: {recordingTime}s</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-mono px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/25">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{liveVolume}% Level</span>
              </div>
            </div>

            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-manrope font-bold text-xs shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop & Process Voice</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <button
              onClick={startRecording}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-manrope font-bold text-xs shadow-[0_0_24px_rgba(0,245,255,0.4)] hover:shadow-[0_0_32px_rgba(0,245,255,0.6)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 sheen-active"
            >
              <Mic className="w-4 h-4" />
              <span>{audioBlob ? "Record Again" : "Start Voice Recording"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Audio Playback & Confirmation Preview */}
      {audioUrl && (
        <div className="p-4 sm:p-5 rounded-2xl spatial-glass-well border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold font-manrope text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{fileName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono border border-emerald-500/30">
                  Ready
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">High-fidelity acoustic audio captured</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <audio
              ref={audioElementRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full spatial-glass-subtle text-xs font-semibold text-slate-700 dark:text-slate-200 border border-black/[0.06] dark:border-white/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-cyan-500" /> : <Play className="w-3.5 h-3.5 text-cyan-500" />}
              <span>{isPlaying ? "Pause" : "Play Back"}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full spatial-glass-subtle text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 border border-black/[0.06] dark:border-white/10 transition-colors"
              title="Discard & Reset Audio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3 shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
