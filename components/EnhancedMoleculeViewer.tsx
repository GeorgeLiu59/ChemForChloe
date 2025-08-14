'use client'

import { useState, useEffect, useRef } from 'react'
import { Info, Search, ExternalLink, Atom } from 'lucide-react'
import axios from 'axios'

interface Molecule {
  name: string
  smiles: string
  description: string
  drawable?: boolean
  pubchemId?: string
  molecularWeight?: string
  formula?: string
}

interface PubChemCompound {
  CID: number
  MolecularFormula: string
  MolecularWeight: number | string | undefined
  CanonicalSMILES: string
  IUPACName: string
}

interface EnhancedMoleculeViewerProps {
  molecules: Molecule[]
}

export default function EnhancedMoleculeViewer({ molecules }: EnhancedMoleculeViewerProps) {
  const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(null)
  const [pubchemData, setPubchemData] = useState<PubChemCompound | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('EnhancedMoleculeViewer received molecules:', molecules)

  useEffect(() => {
    console.log('Molecules changed:', molecules)
    if (molecules.length > 0) {
      // Always update to the first molecule when molecules change
      console.log('Setting selected molecule to:', molecules[0])
      setSelectedMolecule(molecules[0])
    }
  }, [molecules])

  useEffect(() => {
    console.log('Selected molecule changed:', selectedMolecule)
    if (selectedMolecule) {
      console.log('Fetching PubChem data for:', selectedMolecule.name)
      fetchPubChemData(selectedMolecule.name)
    }
  }, [selectedMolecule])

  const fetchPubChemData = async (compoundName: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Search PubChem by name
      const searchResponse = await axios.get(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(compoundName)}/JSON`
      )
      
      if (searchResponse.data.PC_Compounds && searchResponse.data.PC_Compounds.length > 0) {
        const cid = searchResponse.data.PC_Compounds[0].id.id.cid
        
        // Get detailed compound information
        const detailResponse = await axios.get(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON`
        )
        
        if (detailResponse.data.PropertyTable && detailResponse.data.PropertyTable.Properties.length > 0) {
          const compound = detailResponse.data.PropertyTable.Properties[0]
          
          // Ensure MolecularWeight is properly handled
          let molecularWeight = compound.MolecularWeight
          if (typeof molecularWeight === 'string') {
            const parsed = parseFloat(molecularWeight)
            molecularWeight = isNaN(parsed) ? undefined : parsed
          }
          
          setPubchemData({
            CID: cid,
            MolecularFormula: compound.MolecularFormula || 'N/A',
            MolecularWeight: molecularWeight,
            CanonicalSMILES: compound.CanonicalSMILES || 'N/A',
            IUPACName: compound.IUPACName || 'N/A'
          })
        }
      }
    } catch (err) {
      console.error('Error fetching PubChem data:', err)
      setError('Could not fetch molecular data from PubChem')
    } finally {
      setIsLoading(false)
    }
  }

  const getMolViewURL = (smiles: string) => {
    return `https://molview.org/?q=${encodeURIComponent(smiles)}`
  }

  const getPubChemURL = (cid: number) => {
    return `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`
  }



  const renderMolView = (smiles: string) => {
    const molViewURL = getMolViewURL(smiles)
    const pubchemURL = pubchemData ? `https://pubchem.ncbi.nlm.nih.gov/compound/${pubchemData.CID}` : null
    const chemspiderURL = `https://www.chemspider.com/Search.aspx?q=${encodeURIComponent(smiles)}`
    const pubchemImageURL = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/PNG`
    
    console.log('MolView URL:', molViewURL)
    console.log('PubChem Image URL:', pubchemImageURL)
    
    return (
      <div className="space-y-4">
        {/* Main Molecular Structure Display */}
        <div className="w-full h-96 border border-gray-300 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Large Molecular Structure Image */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="bg-white rounded-lg border p-6 mb-4 w-full max-w-md">
                <img 
                  src={pubchemImageURL}
                  alt={`Molecular structure of ${smiles}`}
                  className="w-full h-48 object-contain"
                  onError={(e) => {
                    console.log('Image failed to load, showing fallback')
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Molecular Structure</h3>

            </div>
          </div>
        </div>
        
        {/* External Links Below */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          <a
            href={molViewURL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <ExternalLink size={16} />
            MolView
          </a>
          
          {pubchemURL && (
            <a
              href={pubchemURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Search size={16} />
              PubChem
            </a>
          )}
          
          <a
            href={chemspiderURL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Search size={16} />
            ChemSpider
          </a>
        </div>
        

      </div>
    )
  }



  return (
    <div className="space-y-4">
      {/* Molecule Selector */}
      <div className="flex flex-wrap gap-2">
        {molecules.map((molecule, index) => (
          <button
            key={index}
            onClick={() => setSelectedMolecule(molecule)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedMolecule?.name === molecule.name
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {molecule.name}
            {molecule.drawable && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Drawable
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search for a compound (e.g., benzene, ethanol, aspirin)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLInputElement
              if (target.value.trim()) {
                fetchPubChemData(target.value.trim())
              }
            }
          }}
        />
        <button
          onClick={() => {
            const input = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
            if (input?.value.trim()) {
              fetchPubChemData(input.value.trim())
            }
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Search size={16} />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Fetching molecular data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Molecule Display */}
      {selectedMolecule && (
        <div className="space-y-4">
          {/* Molecular Viewer */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {renderMolView(selectedMolecule.smiles)}
          </div>





          {/* Molecule Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {selectedMolecule.name}
                </h4>
                <p className="text-gray-700 text-sm mb-2">
                  {selectedMolecule.description}
                </p>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
