import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ShakePageProps {
  t?: (key: string) => string;
  onBack?: () => void;
}

export const ShakePage: React.FC<ShakePageProps> = ({ t, onBack }) => {
  const tr = (key: string, fallback: string) => {
    const value = t?.(key) ?? key;
    return value === key ? fallback : value;
  };

  const [isShaking, setIsShaking] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const triggerShake = () => {
    if (isShaking) return;

    setIsShaking(true);
    setResult(null);

    // Vibrate
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      setIsShaking(false);

      const people = [
        tr('shake.people.alice', '附近的: Alice'),
        tr('shake.people.bob', '附近的: Bob'),
        tr('shake.people.mystery', '附近的: 神秘用户'),
      ];
      setResult(people[Math.floor(Math.random() * people.length)]);
    }, 2000);
  };

  return (
    <div className="h-full bg-gray-800 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium">{tr('shake.title', '摇一摇')}</span>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center" onClick={triggerShake}>
        <div className="text-center">
          <div className={`text-8xl mb-4 ${isShaking ? 'animate-pulse' : ''}`}>📱</div>
          <p className="text-gray-400 text-sm">
            {isShaking
              ? tr('shake.searching', '正在搜索同一时刻摇晃手机的人...')
              : tr('shake.hint', '点击屏幕或摇动手机')}
          </p>
        </div>
      </div>

      {/* Result */}
      {result && !isShaking && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gray-200" />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{result}</div>
            <div className="text-xs text-gray-500">{tr('shake.distance', '100米以内')}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShakePage;
