import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";
import type { BeadFinish } from "@/types/customizer";

export const runtime = "nodejs";

const requestSchema = z.object({
  prompt: z.string().min(3).max(300),
  beadCount: z.number().int().min(4).max(40),
});

const FINISHES: BeadFinish[] = [
  "PEARLESCENT",
  "GLOSSY_CANDY",
  "MATTE",
  "METALLIC",
  "WOOD",
  "GEMSTONE",
];

const aiResponseSchema = z.object({
  colors: z.array(z.string().regex(/^#?[0-9a-fA-F]{6}$/)).min(1),
  finish: z.enum(FINISHES as [BeadFinish, ...BeadFinish[]]).optional(),
  summary: z.string().optional(),
});

const SYSTEM_PROMPT = `You are a jewelry design assistant for "Loom & Pearl", a quiet-luxury custom bracelet brand.
A customer will describe a look in plain language. Translate it into a bead color palette.

Respond with ONLY a JSON object, no prose, matching this exact shape:
{
  "colors": ["#RRGGBB", "#RRGGBB", ...],
  "finish": "PEARLESCENT" | "GLOSSY_CANDY" | "MATTE" | "METALLIC" | "WOOD" | "GEMSTONE",
  "summary": "one short sentence describing the design"
}

Rules:
- "colors" must have between 2 and 6 distinct hex colors representing the palette to repeat around the loop. Do not output one entry per bead.
- Favor sophisticated, muted, elegant palettes consistent with quiet luxury (warm neutrals, gold, cream, black, deep jewel tones) unless the user explicitly asks for something bold or colorful.
- Pick the single best "finish" for the described mood: PEARLESCENT for soft/elegant/bridal, GLOSSY_CANDY for playful/colorful/vibrant, MATTE for minimal/understated, METALLIC for edgy/modern, WOOD for earthy/natural, GEMSTONE for rich/jewel-toned.
- Never include any text outside the JSON object.`;

function tileColors(colors: string[], count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const hex = colors[i % colors.length];
    return hex.startsWith("#") ? hex : `#${hex}`;
  });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { prompt, beadCount } = parsed.data;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI design assistant is not configured. Set GROQ_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw);
    const aiResult = aiResponseSchema.parse(json);

    const finish: BeadFinish = aiResult.finish ?? "PEARLESCENT";
    const colors = tileColors(aiResult.colors, beadCount);

    return NextResponse.json({
      beads: colors.map((hexCode) => ({ hexCode, finish })),
      summary: aiResult.summary ?? "Here's a palette inspired by your prompt.",
    });
  } catch (err) {
    console.error("AI design generation failed", err);
    return NextResponse.json(
      { error: "Could not generate a design from that prompt. Please try rephrasing." },
      { status: 502 }
    );
  }
}
