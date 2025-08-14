'use client'

import { useEffect, useRef } from 'react'
import { Atom } from 'lucide-react'

interface MolecularRendererProps {
  smiles: string
  moleculeName: string
}

export default function MolecularRenderer({ smiles, moleculeName }: MolecularRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw molecule based on type
    drawMolecule(ctx, smiles, moleculeName)
  }, [smiles, moleculeName])

  const drawMolecule = (ctx: CanvasRenderingContext2D, smiles: string, name: string) => {
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2

    // Set up drawing styles
    ctx.lineWidth = 2
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'

    // Draw based on molecule type
    if (name.toLowerCase().includes('benzene') || smiles.includes('c1ccccc1')) {
      drawBenzene(ctx, centerX, centerY)
    } else if (name.toLowerCase().includes('ethanol') || smiles === 'CCO') {
      drawEthanol(ctx, centerX, centerY)
    } else if (name.toLowerCase().includes('methanol') || smiles === 'CO') {
      drawMethanol(ctx, centerX, centerY)
    } else {
      drawGenericMolecule(ctx, centerX, centerY, name)
    }

    // Draw molecule name
    ctx.fillStyle = '#374151'
    ctx.fillText(name, centerX, ctx.canvas.height - 20)
  }

  const drawBenzene = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const radius = 60

    // Draw benzene ring (hexagon)
    ctx.strokeStyle = '#1f2937'
    ctx.beginPath()
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

    // Draw alternating double bonds
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 3
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
    ctx.fillStyle = '#059669'
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Draw hydrogen atoms
    ctx.fillStyle = '#3b82f6'
    ctx.font = '12px Arial'
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3
      const x = centerX + (radius + 25) * Math.cos(angle)
      const y = centerY + (radius + 25) * Math.sin(angle)
      
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillText('H', x, y + 4)
    }
  }

  const drawEthanol = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const bondLength = 50
    const atomRadius = 8

    // Draw carbon-carbon bond
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(centerX - bondLength, centerY)
    ctx.lineTo(centerX + bondLength, centerY)
    ctx.stroke()

    // Draw carbon atoms
    ctx.fillStyle = '#059669'
    ctx.beginPath()
    ctx.arc(centerX - bondLength, centerY, atomRadius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(centerX + bondLength, centerY, atomRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw hydrogen atoms on first carbon
    ctx.fillStyle = '#3b82f6'
    ctx.font = '12px Arial'
    const positions1 = [
      { x: centerX - bondLength - 20, y: centerY - 20 },
      { x: centerX - bondLength - 20, y: centerY + 20 },
      { x: centerX - bondLength - 40, y: centerY }
    ]
    positions1.forEach(pos => {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillText('H', pos.x, pos.y + 4)
    })

    // Draw hydrogen atoms on second carbon
    const positions2 = [
      { x: centerX + bondLength + 20, y: centerY - 20 },
      { x: centerX + bondLength + 20, y: centerY + 20 }
    ]
    positions2.forEach(pos => {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillText('H', pos.x, pos.y + 4)
    })

    // Draw oxygen atom (OH group)
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(centerX + bondLength + 40, centerY, atomRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw O-H bond
    ctx.strokeStyle = '#1f2937'
    ctx.beginPath()
    ctx.moveTo(centerX + bondLength + 40, centerY)
    ctx.lineTo(centerX + bondLength + 60, centerY)
    ctx.stroke()

    // Draw hydrogen on oxygen
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(centerX + bondLength + 60, centerY, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillText('H', centerX + bondLength + 60, centerY + 4)
  }

  const drawMethanol = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    const bondLength = 40
    const atomRadius = 8

    // Draw carbon-oxygen bond
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(centerX - bondLength, centerY)
    ctx.lineTo(centerX + bondLength, centerY)
    ctx.stroke()

    // Draw carbon atom
    ctx.fillStyle = '#059669'
    ctx.beginPath()
    ctx.arc(centerX - bondLength, centerY, atomRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw oxygen atom
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.arc(centerX + bondLength, centerY, atomRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Draw hydrogen atoms on carbon
    ctx.fillStyle = '#3b82f6'
    ctx.font = '12px Arial'
    const positions = [
      { x: centerX - bondLength - 20, y: centerY - 20 },
      { x: centerX - bondLength - 20, y: centerY + 20 },
      { x: centerX - bondLength - 40, y: centerY }
    ]
    positions.forEach(pos => {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillText('H', pos.x, pos.y + 4)
    })

    // Draw O-H bond
    ctx.strokeStyle = '#1f2937'
    ctx.beginPath()
    ctx.moveTo(centerX + bondLength, centerY)
    ctx.lineTo(centerX + bondLength + 30, centerY)
    ctx.stroke()

    // Draw hydrogen on oxygen
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(centerX + bondLength + 30, centerY, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillText('H', centerX + bondLength + 30, centerY + 4)
  }

  const drawGenericMolecule = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, name: string) => {
    // Draw a simple representation for unknown molecules
    ctx.fillStyle = '#6b7280'
    ctx.font = '16px Arial'
    ctx.fillText('Molecular Structure', centerX, centerY - 20)
    ctx.fillText('(Generic Representation)', centerX, centerY + 10)
    
    // Draw a simple molecular symbol
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(centerX, centerY + 40, 30, 0, 2 * Math.PI)
    ctx.stroke()
    
    ctx.fillStyle = '#059669'
    ctx.font = '20px Arial'
    ctx.fillText('M', centerX, centerY + 50)
  }

  return (
    <div className="w-full h-96 border border-gray-300 rounded-lg bg-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-4">
        <Atom className="w-8 h-8 text-primary-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-800">Molecular Structure</h3>
        <p className="text-sm text-gray-600 mb-4">SMILES: {smiles}</p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="border border-gray-200 rounded-lg bg-white"
      />
      
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Carbon</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Oxygen</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Hydrogen</span>
          </div>
        </div>
      </div>
    </div>
  )
}
