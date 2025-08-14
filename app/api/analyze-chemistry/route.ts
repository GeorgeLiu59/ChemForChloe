import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Check if Gemini API key is available
const geminiApiKey = process.env.GEMINI_API_KEY
console.log('Gemini API key available:', !!geminiApiKey)
const genai = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
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
            description: 'Aromatic hydrocarbon - common organic compound'
          },
          {
            name: 'Ethanol',
            smiles: 'CCO',
            description: 'Simple alcohol - commonly used solvent'
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
        question: 'Chemistry question from uploaded image (AI analysis requires API key)',
        analysisType: 'fallback_no_api'
      })
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Analyze image with Gemini Vision API
    const model = genai.getGenerativeModel({ model: "gemini-1.5-pro" })
    
    const prompt = `Analyze this chemistry image and extract the following information in JSON format:
    
1. Identify any molecules mentioned or shown in the image
2. Identify any chemical reactions or mechanisms
3. Extract the main chemistry question or problem
4. Provide SMILES notation for any molecules identified
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
  "question": "main chemistry question from the image",
  "analysisType": "ai"
}

If no specific molecules or reactions are clearly visible, provide general chemistry information related to what might be in the image.

CRITICAL: The intermediates array must contain ONLY valid SMILES notation strings, NOT text descriptions. 
Examples of valid SMILES: "CC(=O)O", "c1ccccc1", "CCO", "CCBr", "CCOH"
Examples of INVALID entries: "Protonation of carboxylic acid", "Nucleophilic attack", "text descriptions"
Each intermediate must be a valid chemical structure in SMILES format that can be drawn by PubChem.`

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg"
      }
    }

    const analysis = await model.generateContent([prompt, imagePart])

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
            description: 'Compound identified in the image (analysis incomplete)'
          }
        ],
        reactions: [
          {
            name: 'Chemical Reaction',
            steps: ['Reaction mechanism analysis incomplete']
          }
        ],
        question: 'Chemistry question from uploaded image',
        analysisType: 'ai_fallback'
      })
    }

    return NextResponse.json(parsedResponse)

  } catch (error) {
    console.error('Error analyzing chemistry image:', error)
    
    // Return fallback response if API fails
    return NextResponse.json({
      molecules: [
        {
          name: 'Benzene',
          smiles: 'c1ccccc1',
          description: 'Aromatic hydrocarbon (fallback analysis)'
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
          ]
        }
      ],
      question: 'Chemistry question from uploaded image (AI analysis unavailable)',
      analysisType: 'fallback'
    })
  }
}
