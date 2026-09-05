const LANGUAGE_PAIRS = {
  en: "en|ar",
  ar: "ar|en",
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = body.text;
    const source: keyof typeof LANGUAGE_PAIRS = body.source;

    if (typeof text !== "string" || !text.trim()) {
      return Response.json({ translation: "" });
     }

    if (source !== "en" && source !== "ar") {
      return Response.json({ error: "Invalid source language" }, { status: 400 });
    }

    const params = new URLSearchParams({
      q: text,
      langpair: LANGUAGE_PAIRS[source],
    });
    const response = await fetch(
      `https://api.mymemory.translated.net/get?${params.toString()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return Response.json({ error: "Translation service unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const translation = data?.responseData?.translatedText;

    if (typeof translation !== "string") {
      return Response.json({ error: "Translation failed" }, { status: 502 });
    }

    return Response.json({ translation });
  } catch (error) {
    console.error("Error in POST /api/translate:", error);
    return Response.json({ error: "Translation failed" }, { status: 500 });
  }
}
