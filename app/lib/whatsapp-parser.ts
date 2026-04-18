type ParsedMessage = {
  intent: "expense" | "income" | "unknown";
  amount: number | null;
  merchant: string | null;
  category: string;
  date: string;
};

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function detectCategory(merchant: string) {
  const value = normalizeText(merchant);

  const rules: Array<{ keywords: string[]; category: string }> = [
    {
      keywords: ["extra", "mercado", "supermercado", "atacadao", "guanabara"],
      category: "Alimentação",
    },
    {
      keywords: ["uber", "99", "taxi", "combustivel", "posto"],
      category: "Transporte",
    },
    {
      keywords: ["ifood", "restaurante", "pizzaria", "lanchonete", "mocelin", "resenha na brasa"],
      category: "Alimentação",
    },
    {
      keywords: ["farmacia", "drogasil", "droga raia", "pacheco"],
      category: "Saúde",
    },
    {
      keywords: ["netflix", "spotify", "youtube premium", "prime video"],
      category: "Assinaturas",
    },
    {
      keywords: ["escola", "curso", "faculdade"],
      category: "Educação",
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => value.includes(keyword))) {
      return rule.category;
    }
  }

  return "Outros";
}

export function parseWhatsAppFinanceMessage(rawText: string): ParsedMessage {
  const text = normalizeText(rawText);

  const amountMatch = text.match(/(\d+[.,]?\d{0,2})/);
  const amount = amountMatch
    ? Number(amountMatch[1].replace(".", "").replace(",", "."))
    : null;

  let intent: ParsedMessage["intent"] = "unknown";

  if (
    text.includes("gastei") ||
    text.includes("paguei") ||
    text.includes("comprei")
  ) {
    intent = "expense";
  } else if (
    text.includes("recebi") ||
    text.includes("ganhei") ||
    text.includes("entrou")
  ) {
    intent = "income";
  }

  let merchant: string | null = null;

  const merchantPatterns = [
    /(?:gastei|paguei|comprei|recebi|ganhei|entrou)\s+\d+[.,]?\d{0,2}\s+(?:reais?\s+)?(?:no|na|em|do|da)\s+(.+)$/,
    /(?:gastei|paguei|comprei|recebi|ganhei|entrou)\s+\d+[.,]?\d{0,2}\s+(.+)$/,
  ];

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      merchant = match[1].trim();
      break;
    }
  }

  if (merchant) {
    merchant = merchant
      .replace(/\bhoje\b/g, "")
      .replace(/\bontem\b/g, "")
      .trim();
  }

  const category = merchant ? detectCategory(merchant) : "Outros";

  return {
    intent,
    amount,
    merchant,
    category,
    date: new Date().toISOString(),
  };
}