"use client";

export default function TokenList({ tokenMap, onInsertToken }) {
  const keys = Object.keys(tokenMap || {});
  if (!keys.length) return <div className="text-sm text-gray-500">-</div>;

  return (
    <div className="space-y-1">
      {keys.map((k) => (
        <div key={k} className="group">
          <button
            type="button"
            onClick={() => onInsertToken?.(k)}
            className="w-full text-left p-2 rounded hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
          >
            <div className="flex justify-between items-start gap-2">
              <code className="text-xs font-mono text-blue-600 bg-blue-50 px-1 rounded">
                {`{{${k}}}`}
              </code>
              <span className="text-xs text-gray-500 truncate flex-1 text-right">
                {String(tokenMap[k]).substring(0, 20)}
                {String(tokenMap[k]).length > 20 && "..."}
              </span>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
