import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react'; // Replace with your actual icon library

const ZoomControls = ({ zoom, handleZoomIn, handleZoomOut, handleResetView }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Zoom In"
      >
        <ZoomIn size={24} />
      </button>
      <span className="min-w-[4rem] text-center">
        {(zoom * 100).toFixed(0)}%
      </span>

      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-gray-100 rounded-lg"
        title="Zoom Out"
      >
        <ZoomOut size={24} />
      </button>


      <button
        onClick={handleResetView}
        className="p-2 hover:bg-gray-100 rounded-lg ml-2"
        title="Reset View"
      >
        Reset
      </button>
    </div>
  );
};

export default ZoomControls;