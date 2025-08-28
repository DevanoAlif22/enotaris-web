import { useState } from "react";
// Toolbar Component
export default function Toolbar() {
  const [dateRange] = useState("2025-08-27 ~ 2025-08-27");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRefresh = () => {
    // Simulate refresh action
    console.log("Refreshing data...");
  };

  const handleShare = () => {
    // Simulate share action
    console.log("Sharing data...");
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Date Range Picker */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {/* <Calendar size={16} /> */}
            <span className="hidden sm:inline">{dateRange}</span>
            <span className="sm:hidden">Select Date</span>
          </button>

          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[300px]">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="2025-08-27"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="2025-08-27"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* More Options */}
          <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
