import React, { useState } from 'react';

type Props = {
  onSubmit: (address: string) => void;
  loading: boolean;
};

export function AddressInput({ onSubmit, loading }: Props) {
  const [value, setValue]   = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (v) onSubmit(v);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-0">
      <div
        className={`relative flex-1 ${focused ? 'input-focused' : ''}`}
        style={{
          background: '#0D0D0D',
          border: `1px solid ${focused ? '#FF4C8B80' : '#1C1C1C'}`,
          borderRight: 'none',
          transition: 'border-color 0.15s',
        }}
      >
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0x... or vitalik.eth"
          disabled={loading}
          className="w-full px-5 py-4 bg-transparent focus:outline-none disabled:opacity-30 font-data"
          style={{
            fontSize: '15px',
            color: '#E8E8E8',
            caretColor: '#FF4C8B',
          }}
        />
        <style>{`
          input::placeholder { color: #282828; font-family: 'Share Tech Mono', monospace; }
        `}</style>
      </div>

      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="btn-press font-pixel disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        style={{
          fontSize: '9px',
          padding: '0 28px',
          background: loading ? '#111' : '#FF4C8B',
          color: loading ? '#FF4C8B' : '#000',
          border: `1px solid ${loading ? '#2A2A2A' : '#FF4C8B'}`,
          letterSpacing: '0.08em',
          minHeight: '56px',
        }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                border: '1.5px solid #FF4C8B',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }}
            />
            SCANNING
          </span>
        ) : (
          'ROAST ME'
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
