import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não encontrada. Verifique as configurações de Secrets no AI Studio.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const generateHashtags = async (data: {
  type: string;
  objective: string;
  city: string;
  level: string;
  contentType: string;
}) => {
  const ai = getAI();
  const prompt = `Você é um especialista em crescimento orgânico para corredores no Instagram, TikTok e Strava.

Gere 30 hashtags estratégicas baseadas nas seguintes informações:

Tipo de corrida: ${data.type}
Objetivo: ${data.objective}
Cidade/Região: ${data.city}
Nível do atleta: ${data.level}
Tipo de conteúdo: ${data.contentType}

Organize as hashtags em 3 blocos:

1️⃣ Alto alcance (hashtags grandes)
2️⃣ Médio alcance (hashtags médias)
3️⃣ Nichadas e específicas

Regras:
- Misture hashtags em português e inglês.
- Não repita hashtags.
- Use hashtags reais e usadas por corredores.
- Entregue apenas as hashtags organizadas por bloco.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
};

export const generateCaptionFromImage = async (base64Image: string, mimeType: string) => {
  const ai = getAI();
  const prompt = `Você é um especialista em marketing esportivo para corredores.

Analise a imagem enviada e descreva:
- Ambiente
- Emoção transmitida
- Tipo de corrida
- Nível aparente do atleta
- Clima da cena

Depois gere:
1️⃣ Uma legenda inspiradora para Instagram (até 2200 caracteres)
2️⃣ Uma legenda curta e impactante para TikTok
3️⃣ Uma descrição técnica para Strava
4️⃣ Uma CTA estratégica para engajamento
5️⃣ 15 hashtags relevantes

Tom: Motivador, autêntico e focado em performance.
Evite frases genéricas. Seja específico com base na imagem.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType } },
        { text: prompt }
      ]
    },
  });

  return response.text;
};

export const generateTrainingPlan = async (data: {
  objective: string;
  level: string;
  days: number;
  timePerWorkout: number;
  injuries: string;
}) => {
  const ai = getAI();
  const prompt = `Você é um treinador profissional de corrida especializado em performance.

Crie um plano de treino personalizado baseado em:

Objetivo: ${data.objective}
Nível atual: ${data.level}
Dias disponíveis por semana: ${data.days}
Tempo disponível por treino: ${data.timePerWorkout}
Histórico de lesões: ${data.injuries}

Estruture:
- Treino semanal detalhado
- Ritmo sugerido
- Tipo de treino (intervalado, rodagem, longão)
- Dicas técnicas
- Dicas de recuperação

Use linguagem clara e prática.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
};
