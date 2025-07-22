import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "" 
});

export interface HealthInsightData {
  symptoms: Array<{ name: string; severity: number; date: Date; notes?: string }>;
  medications: Array<{ name: string; adherence: number; lastTaken: Date }>;
  appointments: Array<{ title: string; date: Date; outcome?: string }>;
  metrics: Array<{ type: string; value: string; date: Date }>;
}

export interface GeneratedInsight {
  type: 'pattern' | 'observation' | 'recommendation';
  title: string;
  content: string;
  confidence: number;
}

export async function generateHealthInsights(data: HealthInsightData): Promise<GeneratedInsight[]> {
  try {
    const prompt = `You are a healthcare AI assistant that helps patients understand patterns in their health data. 
    Analyze the following health information and provide supportive, empathetic insights that help the patient understand their health journey.

    IMPORTANT GUIDELINES:
    - NEVER provide medical diagnosis, treatment recommendations, or triage decisions
    - Focus on patterns, observations, and supportive communication
    - Use empathetic, patient-first language
    - Suggest discussing findings with healthcare providers
    - Highlight positive patterns when possible
    - Be gentle with concerns and observations

    Health Data:
    ${JSON.stringify(data, null, 2)}

    Please provide insights in JSON format with the following structure:
    {
      "insights": [
        {
          "type": "pattern|observation|recommendation",
          "title": "Brief title",
          "content": "Detailed, empathetic explanation",
          "confidence": 1-100
        }
      ]
    }

    Limit to 3-4 most relevant insights.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a compassionate healthcare AI that helps patients understand their health data without providing medical advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.insights || [];
  } catch (error) {
    console.error("Error generating health insights:", error);
    throw new Error("Failed to generate health insights");
  }
}

export async function translateClinicalTerm(term: string): Promise<{
  plainLanguage: string;
  explanation: string;
}> {
  try {
    const prompt = `Translate the following medical/clinical term into plain, understandable language:

    Term: "${term}"

    Please provide a response in JSON format:
    {
      "plainLanguage": "Simple term or phrase",
      "explanation": "Clear, friendly explanation in 1-2 sentences"
    }

    Make the explanation accessible to someone without medical background, using everyday language.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical translator that converts complex medical terms into clear, understandable language for patients."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      plainLanguage: result.plainLanguage || "Unable to translate",
      explanation: result.explanation || "Please consult with your healthcare provider for clarification."
    };
  } catch (error) {
    console.error("Error translating clinical term:", error);
    throw new Error("Failed to translate clinical term");
  }
}

export async function generateProviderSummary(userId: string, data: HealthInsightData): Promise<string> {
  try {
    const prompt = `Generate a professional healthcare provider summary based on the following patient data.
    This summary will be shared with healthcare providers to facilitate continuity of care.

    Patient Health Data:
    ${JSON.stringify(data, null, 2)}

    Please create a concise, professional summary that includes:
    - Current medication adherence patterns
    - Recent symptom trends and severity
    - Notable health events or changes
    - Patient-reported outcomes and observations

    Format as a clear, clinical summary suitable for provider handoff.
    Focus on factual observations without making diagnostic conclusions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical documentation assistant that creates professional summaries for healthcare providers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
    });

    return response.choices[0].message.content || "Unable to generate summary";
  } catch (error) {
    console.error("Error generating provider summary:", error);
    throw new Error("Failed to generate provider summary");
  }
}
