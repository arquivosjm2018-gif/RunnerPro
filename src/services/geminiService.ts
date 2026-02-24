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

export const generateNutritionStrategy = async (data: {
  type: string;
  distance: string;
  objective: string;
  time: string;
  level: string;
  restrictions: string;
  currentNutrition: string;
  plan: string;
}) => {
  const ai = getAI();
  
  let prompt = `Você é um nutricionista esportivo especializado em corrida de rua, trail e alta performance.

Seu objetivo é montar uma estratégia alimentar personalizada baseada nas informações abaixo.

⚠️ Importante:
- Você NÃO substitui um nutricionista real.
- Sempre incentive acompanhamento profissional.
- Se o usuário relatar problema de saúde, restrições severas ou sintomas, recomende procurar um profissional.

DADOS DO USUÁRIO:
Tipo de treino: ${data.type}
Distância: ${data.distance}
Objetivo: ${data.objective}
Horário do treino: ${data.time}
Nível: ${data.level}
Restrições alimentares: ${data.restrictions}
Alimentação atual cadastrada pelo usuário:
${data.currentNutrition}

Com base nisso, gere:

1️⃣ Estratégia geral alimentar para esse tipo de treino
2️⃣ Sugestão de CAFÉ DA MANHÃ ideal (se aplicável)
3️⃣ Sugestão de ALMOÇO ideal
4️⃣ O que comer 60-90 minutos antes do treino
5️⃣ O que consumir após o treino (recuperação)
6️⃣ O que EVITAR antes do treino
7️⃣ Dicas de hidratação
8️⃣ Ajustes baseados na alimentação atual do usuário
9️⃣ Respostas para dúvidas comuns sobre esse tipo de treino
🔟 Quando procurar um nutricionista esportivo

Regras:
- Seja claro e didático
- Evite termos excessivamente técnicos
- Explique o porquê das escolhas
- Priorize alimentos acessíveis no Brasil
- Estruture em tópicos organizados`;

  if (data.plan === 'Elite') {
    prompt += `

🔥 VERSÃO PREMIUM – ATLETA ELITE
Adicione:
- Estratégia de periodização nutricional
- Estratégia para prova
- Estratégia para semana pré-competição
- Manipulação de carboidrato
- Estratégia de reposição eletrolítica`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
};
