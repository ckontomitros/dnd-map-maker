"use client"
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eraser, Move, Pencil, Square, ZoomIn, ZoomOut } from 'lucide-react';
import ZoomControls from './ZoomControls'
import roadImage from './assets/road.webp';
import fountain from './assets/fountain.png'
const MapEditor = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [placedTiles, setPlacedTiles] = useState([]);
  const [dropPreview, setDropPreview] = useState(null);
  const gridSize = 8;
  
  const tileCategories = [
    { id: 'terrain', name: 'Terrain', tiles: ['Grass', 'Water', 'Mountain', 'Road', 'Fountain'] },
    { id: 'buildings', name: 'Buildings', tiles: ['House', 'Tower', 'Wall'] },
    { id: 'furniture', name: 'Furniture', tiles: ['Table', 'Chair', 'Bed'] },
  ];

  const terrainTiles = {
    Grass: { color: '#90EE90', symbol: '🌱' , width: 10, height: 2},
    Water: { color: '#87CEEB', symbol: '💧',width: 5, height: 5 },
    Mountain: { color: '#8B4513', symbol: '⛰️',width: 3, height: 10 },
    Road: { color: '#8B4543', symbol: '⛰️',width: 3, height: 10, image:roadImage },
    Fountain: { color: '#8B4543', symbol: '⛰️',width: 10, height: 10, image:fountain }
  };

  const tools = [
    { id: 'move', icon: Move, name: 'Move' },
    { id: 'draw', icon: Pencil, name: 'Draw' },
    { id: 'wall', icon: Square, name: 'Wall' },
    { id: 'eraser', icon: Eraser, name: 'Eraser' },
  ];

   // Get grid position from mouse coordinates
   const getGridPosition = (clientX: number, clientY: number) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    
    return {
      x: Math.floor(x / gridSize) * gridSize,
      y: Math.floor(y / gridSize) * gridSize
    };
  };
   // Check if position is within canvas bounds
   const isWithinBounds = (x, y) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return x >= 0 && y >= 0 && 
           x < rect.width / zoom && 
           y < rect.height / zoom;
  };


  // Handle tile drag over
  
  const handleTileDragStart = (e, tile) => {
    e.dataTransfer.setData('tile', tile);
  };

  // Handle tile drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    const { x, y } = getGridPosition(e.clientX, e.clientY);
    
    if (isWithinBounds(x, y)) {
      const tile = e.dataTransfer.types.includes('tile') && 
                  e.dataTransfer.getData('tile');
      
      if (tile && terrainTiles[tile]) {
        setDropPreview({ type: tile, x, y });
        e.dataTransfer.dropEffect = 'copy';
      }
    } else {
      setDropPreview(null);
      e.dataTransfer.dropEffect = 'none';
    }
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDropPreview(null);
  };

  // Handle tile drop
  const handleDrop = (e) => {
    e.preventDefault();
    const tile = e.dataTransfer.getData('tile');
    const { x, y } = getGridPosition(e.clientX, e.clientY);
    
    if (isWithinBounds(x, y)) {
      setPlacedTiles([...placedTiles, {
        type: tile,
        x,
        y,
        id: Date.now()
      }]);
    }
    
    setDropPreview(null);
  };

  // Render tiles and preview
  const renderTiles = () => {
    const tiles = [...placedTiles];
    if (dropPreview) {
      tiles.push({ ...dropPreview, id: 'preview', isPreview: true });
    }
    return tiles.map(tile => (
        <div
          key={tile.id}
          className={`absolute flex items-center justify-center ${
            tile.isPreview ? 'opacity-50' : ''
          }`}
          style={{
            left: `${tile.x}px`,
            top: `${tile.y}px`,
            width: `${gridSize*terrainTiles[tile.type]?.width}px`,
            height: `${gridSize*terrainTiles[tile.type]?.height}px`,
            backgroundColor: terrainTiles[tile.type]?.color || 'gray',
            fontSize: `${24 / zoom}px`, // Adjust font size based on zoom
            border: tile.isPreview ? '2px dashed #666' : '1px solid rgba(0,0,0,0.1)',
            pointerEvents: tile.isPreview ? 'none' : 'auto',
            zIndex: tile.isPreview ? 1000 : 1
          }}
        >
            {terrainTiles[tile.type]?.image.src ? (
          <img
            src={terrainTiles[tile.type]?.image.src}
            alt={tile.type}
            className="w-full h-full object-cover"

          />
        ) : (
          <div
          >
          {terrainTiles[tile.type]?.symbol}
          {terrainTiles[tile.type]?.symbol}
            {terrainTiles[tile.type]?.symbol}
          </div>
        )}
        
        </div>
      ));
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e:any) => {
    e.preventDefault();
    const zoomFactor = 0.1; 
    const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    
    // Calculate cursor position relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate new pan position to zoom towards cursor
    if (newZoom !== zoom) {
      const scaleFactor = newZoom / zoom;
      const newPan = {
        x: x - (x - pan.x) * scaleFactor,
        y: y - (y - pan.y) * scaleFactor
      };
      setPan(newPan);
      setZoom(newZoom);
    }
  };

  // Handle pan with mouse drag
  const handleMouseDown = (e:any) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = (e:any) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset zoom and pan
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Custom zoom buttons
  const handleZoomIn = () => {
    setZoom(Math.min(3, zoom + 0.1));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.5, zoom - 0.1));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`h-screen bg-white shadow-lg transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-0'
      }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold">Tiles Library</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {tileCategories.map((category) => (
              <div key={category.id} className="p-4">
                <h3 className="font-semibold mb-2">{category.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {category.tiles.map((tile) => (
                    <div
                      key={tile}
                      className="bg-gray-200 p-2 rounded cursor-move text-center flex items-center justify-center gap-2 hover:bg-gray-300"
                      draggable="true"
                      onDragStart={(e) => handleTileDragStart(e, tile)}
                    >
                      {terrainTiles[tile]?.symbol}
                      <span>{tile}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="absolute left-64 top-1/2 transform -translate-y-1/2 bg-white p-1 rounded-r shadow-md z-10"
        style={{ left: isSidebarOpen ? '15.5rem' : '0' }}
      >
        {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Toolbar */}
        <div className="bg-white p-2 shadow-md flex justify-between items-center">
          <div className="flex gap-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                className="p-2 hover:bg-gray-100 rounded-lg tooltip"
                title={tool.name}
              >
                <tool.icon size={24} />
              </button>
            ))}
          </div>
          
          {/* Zoom Controls */}
          <div>
      {/* Other components */}
      <ZoomControls
        zoom={zoom}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleResetView={handleResetView}
      />
    </div>
        </div>

         {/* Canvas Area */}
         <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="absolute inset-0 w-7xl h-7xl"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              backgroundImage: `
                repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%),
                repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)
              `,
              backgroundSize: `${gridSize }px ${gridSize }px`,
              transform: `scale(${zoom}) translate(${pan.x }px, ${pan.y }px)`,
              transformOrigin: '0 0',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            {renderTiles()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapEditor;