'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, RotateCw, ArrowRight, Beaker, Zap, ExternalLink, Search } from 'lucide-react'

interface Reaction {
  name: string
  steps: string[]
  reactants?: string[]
  products?: string[]
  intermediates?: string[]
}

interface ReactionMechanismProps {
  reactions: Reaction[]
}

export default function ReactionMechanism({ reactions }: ReactionMechanismProps) {
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null)
  const [currentStep, setCurrentStep] = useState(0)


  // Auto-select first reaction
  useEffect(() => {
    if (reactions.length > 0 && !selectedReaction) {
      setSelectedReaction(reactions[0])
    }
  }, [reactions, selectedReaction])



  const handleStepChange = (direction: 'next' | 'prev') => {
    if (!selectedReaction) return

    if (direction === 'next') {
      setCurrentStep(prev => Math.min(prev + 1, selectedReaction.steps.length - 1))
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 0))
    }
  }



  const handleReset = () => {
    setCurrentStep(0)
  }





  return (
    <div className="space-y-6">
      {reactions.length === 0 ? (
        <div className="text-center py-8">
          <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reaction Mechanisms</h3>
          <p className="text-gray-600">No reaction mechanisms were identified in the analysis.</p>
        </div>
      ) : (
        <>
          {/* Reaction Selector */}
          <div className="flex flex-wrap gap-2">
            {reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedReaction(reaction)
                  setCurrentStep(0)
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedReaction?.name === reaction.name
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {reaction.name}
              </button>
            ))}
          </div>

      {selectedReaction && (
        <div className="space-y-4">
          {/* Step Display */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedReaction.name} - Step {currentStep + 1} of {selectedReaction.steps.length}
              </h3>
              
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Reset"
                >
                  <RotateCw size={16} />
                </button>

                <button
                  onClick={() => handleStepChange('prev')}
                  disabled={currentStep === 0}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  title="Previous Step"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handleStepChange('next')}
                  disabled={currentStep === selectedReaction.steps.length - 1}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  title="Next Step"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Step Visualization */}
            <div className="space-y-4">
              {/* Reaction Mechanism Visualization */}
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200 rounded-lg p-6 w-full text-center">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Reaction Mechanism</h3>
                    <p className="text-gray-600 mb-4">
                      Step {currentStep + 1}: {selectedReaction.steps[currentStep]}
                    </p>
                  </div>
                  
                                {/* Static Reactants and Products View */}
              <div className="bg-white rounded-lg border p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reactants */}
                  {selectedReaction.reactants && selectedReaction.reactants.length > 0 && (
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Reactants</h4>
                      <div className="space-y-4">
                        {selectedReaction.reactants.map((smiles, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <img 
                              src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/PNG`}
                              alt={`Reactant ${index + 1} molecular structure`}
                              className="w-full h-48 object-contain mx-auto"
                              onError={(e) => {
                                console.log('PubChem image failed to load for reactant:', smiles)
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Products */}
                  {selectedReaction.products && selectedReaction.products.length > 0 && (
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Products</h4>
                      <div className="space-y-4">
                        {selectedReaction.products.map((smiles, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <img 
                              src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/PNG`}
                              alt={`Product ${index + 1} molecular structure`}
                              className="w-full h-48 object-contain mx-auto"
                              onError={(e) => {
                                console.log('PubChem image failed to load for product:', smiles)
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {(!selectedReaction.reactants || selectedReaction.reactants.length === 0) && 
                 (!selectedReaction.products || selectedReaction.products.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600">
                      No molecular structures available for this reaction step
                    </p>
                  </div>
                )}
              </div>


                </div>
              </div>
              

            </div>

            {/* Step Description */}
            <div className="reaction-step">
              <p className="text-gray-800 font-medium">
                {selectedReaction.steps[currentStep]}
              </p>
            </div>
          </div>

          {/* Step Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{currentStep + 1} / {selectedReaction.steps.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / selectedReaction.steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* All Steps Overview */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">All Steps:</h4>
            <div className="space-y-2">
              {selectedReaction.steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    index === currentStep
                      ? 'bg-primary-50 border-primary-300 text-primary-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === currentStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                    {index < selectedReaction.steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
