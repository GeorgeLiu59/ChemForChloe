'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, RotateCw, ZoomIn, ZoomOut, Info } from 'lucide-react'

interface Molecule {
  name: string
  smiles: string
  description: string
}

interface MoleculeViewerProps {
  molecules: Molecule[]
}

export default function MoleculeViewer({ molecules }: MoleculeViewerProps) {
  const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(null)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (molecules.length > 0 && !selectedMolecule) {
      setSelectedMolecule(molecules[0])
    }
  }, [molecules, selectedMolecule])

  useEffect(() => {
    if (selectedMolecule && canvasRef.current) {
      drawMolecule(selectedMolecule.smiles)
    }
  }, [selectedMolecule, zoom])

  const drawMolecule = (smiles: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    canvas.width = 400
    canvas.height = 300

    // Draw molecule representation (simplified for demo)
    ctx.save()
    ctx.scale(zoom, zoom)
    ctx.translate(50, 50)

    // Draw benzene ring as example
    if (smiles.includes('c1ccccc1')) {
      drawBenzeneRing(ctx)
    } else {
      drawGenericMolecule(ctx, smiles)
    }

    ctx.restore()
  }

  const drawBenzeneRing = (ctx: CanvasRenderingContext2D) => {
    const centerX = 150
    const centerY = 100
    const radius = 40

    // Draw hexagon
    ctx.beginPath()
    ctx.strokeStyle = '#1e40af'
    ctx.lineWidth = 3
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()

    // Draw double bonds (alternating)
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 2
    
    for (let i = 0; i < 6; i += 2) {
      const angle1 = (i * Math.PI) / 3
      const angle2 = ((i + 1) * Math.PI) / 3
      const x1 = centerX + radius * Math.cos(angle1)
      const y1 = centerY + radius * Math.sin(angle1)
      const x2 = centerX + radius * Math.cos(angle2)
      const y2 = centerY + radius * Math.sin(angle2)
      
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // Draw carbon atoms
    ctx.fillStyle = '#1e40af'
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Add labels
    ctx.fillStyle = '#374151'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Benzene (C₆H₆)', centerX, centerY + radius + 30)
  }

  const drawGenericMolecule = (ctx: CanvasRenderingContext2D, smiles: string) => {
    // Draw a simple molecular representation
    ctx.fillStyle = '#374151'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`Molecule: ${smiles}`, 150, 100)
    ctx.fillText('(Molecular structure rendering)', 150, 120)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${selectedMolecule?.name || 'molecule'}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="space-y-4">
      {/* Molecule Selector */}
      <div className="flex flex-wrap gap-2">
        {molecules.map((molecule, index) => (
          <button
            key={index}
            onClick={() => setSelectedMolecule(molecule)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMolecule?.name === molecule.name
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {molecule.name}
          </button>
        ))}
      </div>

      {/* Molecule Display */}
      {selectedMolecule && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-64 border border-gray-300 rounded"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={handleReset}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Reset Zoom"
              >
                <RotateCw size={16} />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <span className="text-sm text-gray-600 ml-2">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <button
              onClick={downloadImage}
              className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download size={16} />
              Download
            </button>
          </div>

          {/* Molecule Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  {selectedMolecule.name}
                </h4>
                <p className="text-blue-800 text-sm mb-2">
                  {selectedMolecule.description}
                </p>
                <p className="text-blue-700 text-xs font-mono">
                  SMILES: {selectedMolecule.smiles}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
