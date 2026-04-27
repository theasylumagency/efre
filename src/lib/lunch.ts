import type { LunchContent, LunchItem } from "@/data/lunch";

function compactPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return value.trim().startsWith("+") ? `+${digits}` : digits;
}

function compactWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function createTelHref(phone: string) {
  return `tel:${compactPhoneNumber(phone)}`;
}

export function createWhatsAppHref(phone: string, message: string) {
  return `https://wa.me/${compactWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;
}

export function createGenericOrderMessage() {
  return "გამარჯობა, მინდა ბიზნეს ლანჩის შეკვეთა.";
}

export function createLunchOrderMessage(number: string) {
  return `გამარჯობა, მინდა ლანჩი ${number}.`;
}

export function getQuickOrderHref(content: Pick<LunchContent, "phone" | "whatsapp">) {
  if (content.whatsapp) {
    return createWhatsAppHref(content.whatsapp, createGenericOrderMessage());
  }

  return createTelHref(content.phone);
}

export function getCardOrderHref(
  content: Pick<LunchContent, "phone" | "whatsapp">,
  item: Pick<LunchItem, "number">,
) {
  if (content.whatsapp) {
    return createWhatsAppHref(
      content.whatsapp,
      createLunchOrderMessage(item.number),
    );
  }

  return createTelHref(content.phone);
}

export function getCommonPriceLine(commonPrice: string | null) {
  return commonPrice ? `ყველა ლანჩი — ${commonPrice}` : null;
}

export function getPosterPriceRows(content: LunchContent) {
  if (content.commonPrice) {
    return [
      {
        label: "ფასი",
        value: getCommonPriceLine(content.commonPrice) ?? content.commonPrice,
      },
    ];
  }

  return content.lunchItems
    .filter((item) => item.price)
    .map((item) => ({
      label: item.number,
      value: item.price as string,
    }));
}
