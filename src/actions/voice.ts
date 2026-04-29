"use server";

import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function parseVoiceCommand(transcript: string, groupMembers: any[]) {
  if (!openai) return null;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert at parsing financial transactions. Extract the following from the transcript in JSON format: 
          - amount (number)
          - category (string)
          - description (string)
          - mentionedUsers (array of strings, matching names or IDs from the provided member list)
          
          Member list: ${JSON.stringify(groupMembers.map(m => ({ id: m.userId, name: m.user.name })))}
          
          Default to 'Other' for category if not clear. 
          Respond ONLY with the JSON.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content || "{}");
  } catch (error) {
    console.error("Voice parsing error:", error);
    return null;
  }
}
