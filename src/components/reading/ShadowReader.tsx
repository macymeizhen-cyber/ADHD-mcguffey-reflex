import { useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface ShadowReaderProps {
  targetText: string;
  onComplete?: (result: { accuracy: number; speed: number; mastered: boolean }) => void;
}

export function ShadowReader({ targetText, onComplete }: ShadowReaderProps) {
  const [result, setResult] = useState<{ accuracy: number; speed: number; mastered: boolean } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleResult = (data: { accuracy: number; speed: number; transcript: string }) => {
    const mastered = data.accuracy >= 85 && data.speed >= 60;
    const finalResult = { accuracy: data.accuracy, speed: data.speed, mastered };
    setResult(finalResult);
    setIsCompleted(true);
    if (onComplete) {
      onComplete(finalResult);
    }
  };

  const { isRecording, transcript, error, startRecording, stopRecording, isSupported } = useSpeechRecognition({
    targetText,
    onResult: handleResult
  });

  const handleStart = () => {
    setResult(null);
    setIsCompleted(false);
    startRecording();
  };

  if (!isSupported) {
    return (
      <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
        <p className="text-yellow-700">⚠️ 您的浏览器不支持语音识别</p>
        <p className="text-sm text-yellow-600 mt-1">请使用 Chrome、Edge 或 Safari 浏览器</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-600">❌ {error}</p>
          {error.includes('麦克风权限') && (
            <p className="text-sm text-red-500 mt-1">
              请点击浏览器地址栏左侧的 🔒 图标，允许麦克风权限后刷新重试
            </p>
          )}
        </div>
      )}

      {!isCompleted && !result && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : handleStart}
            className={`px-8 py-4 rounded-full text-white font-bold text-lg transition ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRecording ? '🔴 停止录音' : '🎤 开始朗读'}
          </button>
          {isRecording && (
            <p className="text-gray-500">正在录音中，请大声朗读...</p>
          )}
          {transcript && !isRecording && (
            <div className="w-full p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">识别结果：</p>
              <p className="text-gray-800">{transcript}</p>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="p-6 bg-green-50 rounded-xl border border-green-200">
          <h3 className="font-bold text-green-800">✅ 朗读完成！</h3>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{result.accuracy}%</p>
              <p className="text-sm text-gray-500">准确率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{result.speed}</p>
              <p className="text-sm text-gray-500">语速 (词/分钟)</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${result.mastered ? 'text-green-600' : 'text-orange-500'}`}>
                {result.mastered ? '✅ 已掌握' : '🔄 再练练'}
              </p>
              <p className="text-sm text-gray-500">状态</p>
            </div>
          </div>
          {!result.mastered && (
            <p className="mt-3 text-sm text-orange-600 text-center">
              需要 85% 以上准确率且语速 ≥ 60 词/分钟才能掌握
            </p>
          )}
        </div>
      )}
    </div>
  );
}
