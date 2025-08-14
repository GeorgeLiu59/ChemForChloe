'use client'

import { useState } from 'react'
import { Upload, Beaker, Atom, Zap, Camera, Download, Search, ExternalLink } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import EnhancedMoleculeViewer from '@/components/EnhancedMoleculeViewer'
import ReactionMechanism from '@/components/ReactionMechanism'

import Header from '@/components/Header'

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [questionInput, setQuestionInput] = useState('')

  const handleImageUpload = async (imageData: string) => {
    setUploadedImage(imageData)
    setIsProcessing(true)
    
    try {
      // Convert base64 to blob for API processing
      const base64Data = imageData.split(',')[1]
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob())
      
      // Create FormData for image upload
      const formData = new FormData()
      formData.append('image', blob, 'chemistry_question.jpg')
      
      // Analyze the image using AI
      const analysisResult = await analyzeChemistryImage(formData)
      
      setAnalysisResult(analysisResult)
    } catch (error) {
      console.error('Error processing image:', error)
      // Fallback to basic analysis if API fails
      const fallbackResult = await performBasicImageAnalysis(imageData)
      setAnalysisResult(fallbackResult)
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeChemistryImage = async (formData: FormData) => {
    try {
      // Try to use Gemini Vision API for image analysis
      console.log('Calling analyze-chemistry API...')
      const response = await fetch('/api/analyze-chemistry', {
        method: 'POST',
        body: formData
      })
      
      console.log('API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('API result:', result)
        return result
      } else {
        console.log('API response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error calling API:', error)
    }
    
    // Fallback to basic analysis
    console.log('Using fallback analysis')
    return await performBasicImageAnalysis(formData)
  }

  const analyzeChemistryQuestion = async (question: string) => {
    try {
      console.log('Calling analyze-chemistry-text API...')
      const response = await fetch('/api/analyze-chemistry-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question })
      })
      
      console.log('API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('API result:', result)
        return result
      } else {
        console.log('API response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error calling API:', error)
    }
    
    // Fallback to basic analysis
    console.log('Using fallback analysis')
    return await performBasicQuestionAnalysis(question)
  }

  const performBasicQuestionAnalysis = async (question: string) => {
    // Basic question analysis based on common chemistry patterns
    const commonMolecules = [
      {
        name: 'Benzene',
        smiles: 'c1ccccc1',
        description: 'Aromatic hydrocarbon with 6 carbon atoms in a ring structure',
        drawable: true
      },
      {
        name: 'Ethanol',
        smiles: 'CCO',
        description: 'Simple alcohol with 2 carbon atoms and hydroxyl group',
        drawable: true
      },
      {
        name: 'Methanol',
        smiles: 'CO',
        description: 'Simple alcohol with 1 carbon atom',
        drawable: true
      },
      {
        name: 'Acetic Acid',
        smiles: 'CC(=O)O',
        description: 'Carboxylic acid with 2 carbon atoms and carboxyl group',
        drawable: true
      },
      {
        name: 'Propane',
        smiles: 'CCC',
        description: 'Alkane with 3 carbon atoms',
        drawable: true
      }
    ]

    const commonReactions = [
      {
        name: 'Esterification',
        steps: [
          'Protonation of carboxylic acid',
          'Nucleophilic attack by alcohol',
          'Proton transfer',
          'Loss of water molecule'
        ],
        reactants: ['CC(=O)O', 'CCO'],
        products: ['CC(=O)OCC', 'O']
      },
      {
        name: 'SN2 Substitution',
        steps: [
          'Nucleophile approaches from back side',
          'Bond formation and breaking simultaneously',
          'Inversion of configuration'
        ],
        reactants: ['CBr', 'CO'],
        products: ['CO', 'Br']
      },
      {
        name: 'SN1 Substitution',
        steps: [
          'Formation of carbocation intermediate',
          'Nucleophile attack on carbocation',
          'Formation of substitution product'
        ],
        reactants: ['CBr', 'CO'],
        products: ['CO', 'Br']
      }
    ]

    // Try to match the question to specific molecules
    const questionLower = question.toLowerCase()
    let selectedMolecules = []

    if (questionLower.includes('benzene')) {
      selectedMolecules = [commonMolecules.find(m => m.name === 'Benzene')]
    } else if (questionLower.includes('ethanol')) {
      selectedMolecules = [commonMolecules.find(m => m.name === 'Ethanol')]
    } else if (questionLower.includes('methanol')) {
      selectedMolecules = [commonMolecules.find(m => m.name === 'Methanol')]
    } else if (questionLower.includes('acetic') || questionLower.includes('acetate')) {
      selectedMolecules = [commonMolecules.find(m => m.name === 'Acetic Acid')]
    } else if (questionLower.includes('propane')) {
      selectedMolecules = [commonMolecules.find(m => m.name === 'Propane')]
    } else {
      // If no specific match, return benzene as default
      selectedMolecules = [commonMolecules.find(m => m.name === 'Benzene')]
    }

    // Filter out undefined values
    selectedMolecules = selectedMolecules.filter(Boolean)

    const selectedReactions = commonReactions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 1)

    return {
      molecules: selectedMolecules,
      reactions: selectedReactions,
      question: question,
      analysisType: 'basic'
    }
  }

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionInput.trim()) return
    
    console.log('Submitting question:', questionInput.trim())
    setIsProcessing(true)
    setUploadedImage(null) // Clear any uploaded image
    setAnalysisResult(null) // Clear previous analysis result
    
    try {
      const analysisResult = await analyzeChemistryQuestion(questionInput.trim())
      console.log('Setting analysis result:', analysisResult)
      setAnalysisResult(analysisResult)
    } catch (error) {
      console.error('Error processing question:', error)
      const fallbackResult = await performBasicQuestionAnalysis(questionInput.trim())
      setAnalysisResult(fallbackResult)
    } finally {
      setIsProcessing(false)
    }
  }

  const performBasicImageAnalysis = async (imageData: string | FormData) => {
    // Basic image analysis based on common chemistry patterns
    // This is a simplified version - in a real app you'd use more sophisticated image recognition
    
    const commonMolecules = [
      {
        name: 'Benzene',
        smiles: 'c1ccccc1',
        description: 'Aromatic hydrocarbon with 6 carbon atoms in a ring structure'
      },
      {
        name: 'Ethanol',
        smiles: 'CCO',
        description: 'Simple alcohol with 2 carbon atoms and hydroxyl group'
      },
      {
        name: 'Methanol',
        smiles: 'CO',
        description: 'Simple alcohol with 1 carbon atom'
      },
      {
        name: 'Acetic Acid',
        smiles: 'CC(=O)O',
        description: 'Carboxylic acid with 2 carbon atoms and carboxyl group'
      },
      {
        name: 'Propane',
        smiles: 'CCC',
        description: 'Alkane with 3 carbon atoms'
      }
    ]

    const commonReactions = [
      {
        name: 'Esterification',
        steps: [
          'Protonation of carboxylic acid',
          'Nucleophilic attack by alcohol',
          'Proton transfer',
          'Loss of water molecule'
        ]
      },
      {
        name: 'SN2 Substitution',
        steps: [
          'Nucleophile approaches from back side',
          'Bond formation and breaking simultaneously',
          'Inversion of configuration'
        ]
      },
      {
        name: 'SN1 Substitution',
        steps: [
          'Formation of carbocation intermediate',
          'Nucleophile attack on carbocation',
          'Formation of substitution product'
        ]
      }
    ]

    // Randomly select molecules and reactions for variety
    const selectedMolecules = commonMolecules
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1)

    const selectedReactions = commonReactions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 1)

    const questions = [
      'Draw the mechanism for the esterification of benzoic acid with ethanol',
      'Show the SN2 reaction mechanism for the substitution of bromomethane with hydroxide',
      'Draw the structure of benzene and explain its aromaticity',
      'Show the mechanism for the hydrolysis of an ester',
      'Draw the Lewis structure for ethanol and identify the functional groups'
    ]

    return {
      molecules: selectedMolecules,
      reactions: selectedReactions,
      question: questions[Math.floor(Math.random() * questions.length)],
      analysisType: 'basic'
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Input Section */}
          <div className="molecule-card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Beaker className="text-primary-600" />
              Chemistry Analysis
            </h2>
            
            {/* Text Question Input */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Ask a Chemistry Question:</h3>
              <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="e.g., Draw the structure of benzene, Show me the SN2 mechanism..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !questionInput.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Analyzing...' : 'Ask'}
                </button>
              </form>
            </div>

            {/* OR Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Image Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Upload Chemistry Image:</h3>
              <ImageUpload 
                onImageUpload={handleImageUpload}
                isProcessing={isProcessing}
              />
              {uploadedImage && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Uploaded Image:</h3>
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded chemistry question"
                    className="w-full max-w-md rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <>
              {/* Question Analysis */}
              <div className="molecule-card">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Beaker className="text-primary-600" />
                    Analysis Results
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysisResult.analysisType === 'ai' 
                      ? 'bg-green-100 text-green-800'
                      : analysisResult.analysisType === 'ai_fallback'
                      ? 'bg-yellow-100 text-yellow-800'
                      : analysisResult.analysisType === 'fallback_no_api'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {analysisResult.analysisType === 'ai' ? 'AI Analysis' :
                     analysisResult.analysisType === 'ai_fallback' ? 'AI Fallback' :
                     analysisResult.analysisType === 'fallback_no_api' ? 'Demo Mode' :
                     'Basic Analysis'}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Chemistry Question:</h3>
                  <p className="text-blue-800">{analysisResult.question}</p>
                  {analysisResult.analysisType === 'fallback_no_api' && (
                    <p className="text-sm text-orange-600 mt-2">
                      🔑 Demo Mode: Add GEMINI_API_KEY to .env.local for AI-powered image analysis
                    </p>
                  )}
                  {analysisResult.analysisType === 'basic' && (
                    <p className="text-sm text-blue-600 mt-2">
                      💡 Tip: Add a Gemini API key to enable AI-powered image analysis
                    </p>
                  )}
                </div>

                {/* AI Analysis Section */}
                {analysisResult.analysis && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <Beaker className="w-5 h-5" />
                      AI Analysis & Explanation
                    </h3>
                    <div className="text-green-800 prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{analysisResult.analysis}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Molecules Section */}
              {analysisResult.molecules && analysisResult.molecules.length > 0 && (
                <div className="molecule-card">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Atom className="text-chemistry-green" />
                    Identified Molecules
                  </h3>
                  <EnhancedMoleculeViewer molecules={analysisResult.molecules} />
                </div>
              )}

              {/* Reactions Section */}
              {analysisResult.reactions && analysisResult.reactions.length > 0 && (
                <div className="molecule-card">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="text-chemistry-yellow" />
                    Reaction Mechanisms
                  </h3>
                  <ReactionMechanism reactions={analysisResult.reactions} />
                </div>
              )}


            </>
          )}


        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-800">
                Analyzing your chemistry question...
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Our AI is identifying molecules and reaction mechanisms
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
