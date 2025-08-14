import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Check if Gemini API key is available
const geminiApiKey = process.env.GEMINI_API_KEY
const genai = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null

export async function POST(request: NextRequest) {
  let question = ''
  try {
    const body = await request.json()
    question = body.question || ''
    
    if (!question) {
      return NextResponse.json(
        { error: 'No question provided' },
        { status: 400 }
      )
    }

    // If no Gemini API key is configured, return fallback immediately
    if (!genai) {
      console.log('Gemini API key not configured, using fallback analysis')
      return NextResponse.json({
        molecules: [
          {
            name: 'Benzene',
            smiles: 'c1ccccc1',
            description: 'Aromatic hydrocarbon - common organic compound',
            drawable: true
          },
          {
            name: 'Ethanol',
            smiles: 'CCO',
            description: 'Simple alcohol - commonly used solvent',
            drawable: true
          }
        ],
        reactions: [
          {
            name: 'Esterification',
            steps: [
              'Protonation of carboxylic acid',
              'Nucleophilic attack by alcohol',
              'Proton transfer',
              'Loss of water molecule'
            ],
            reactants: ['CC(=O)O', 'CCO'],
            products: ['CC(=O)OCC', 'O'],
            intermediates: ['CC(=O)OH2+', 'CC(=O)OCC(OH)2', 'CC(=O)OCC']
          }
        ],
        question: question,
        analysisType: 'fallback_no_api'
      })
    }

    // Analyze text with Gemini API
    const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const prompt = `Analyze this chemistry question and extract the following information in JSON format:
    
Question: "${question}"

1. Identify any molecules mentioned in the question
2. Identify any chemical reactions or mechanisms
3. Provide SMILES notation for any molecules identified
4. If the question asks to draw something, provide the molecular structures needed
5. For each reaction step, provide the SMILES notation of the intermediate molecule formed

Return the response in this exact JSON format:
{
  "molecules": [
    {
      "name": "molecule name",
      "smiles": "SMILES notation",
      "description": "brief description",
      "drawable": true
    }
  ],
  "reactions": [
    {
      "name": "reaction name",
      "steps": ["step 1", "step 2", "step 3"],
      "reactants": ["SMILES1", "SMILES2"],
      "products": ["SMILES3", "SMILES4"],
      "intermediates": ["CC(=O)OH2+", "CC(=O)OCC(OH)2", "CC(=O)OCC"]
    }
  ],
  "question": "original question",
  "analysisType": "ai"
}

If the question asks to draw specific molecules, make sure to include them in the molecules array with proper SMILES notation.

CRITICAL: The intermediates array must contain ONLY valid SMILES notation strings, NOT text descriptions. 
Examples of valid SMILES: "CC(=O)O", "c1ccccc1", "CCO", "CCBr", "CCOH"
Examples of INVALID entries: "Protonation of carboxylic acid", "Nucleophilic attack", "text descriptions"
Each intermediate must be a valid chemical structure in SMILES format that can be drawn by PubChem.`

    const analysis = await model.generateContent(prompt)
    const responseText = analysis.response.text() || ''
    
    console.log('Raw Gemini response:', responseText)
    
    // Try to parse JSON from the response
    let parsedResponse
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
        console.log('Parsed response:', parsedResponse)
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // Fallback to basic analysis
      return NextResponse.json({
        molecules: [
          {
            name: 'Unknown Compound',
            smiles: 'C',
            description: 'Compound mentioned in the question (analysis incomplete)',
            drawable: true
          }
        ],
        reactions: [
          {
            name: 'Chemical Reaction',
            steps: ['Reaction mechanism analysis incomplete'],
            reactants: ['C'],
            products: ['C']
          }
        ],
        question: question,
        analysisType: 'ai_fallback'
      })
    }

    return NextResponse.json(parsedResponse)

  } catch (error) {
    console.error('Error analyzing chemistry question:', error)
    
    // Return fallback response if API fails
    return NextResponse.json({
      molecules: [
        {
          name: 'Benzene',
          smiles: 'c1ccccc1',
          description: 'Aromatic hydrocarbon (fallback analysis)',
          drawable: true
        }
      ],
      reactions: [
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
        }
      ],
      question: question || 'Chemistry question',
      analysisType: 'fallback'
    })
  }
}
