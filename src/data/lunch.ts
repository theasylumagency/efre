export type LunchItem = {
  id: string;
  number: string;
  name: string;
  includes: string;
  price?: string;
};

export type LunchContent = {
  eyebrow: string;
  pageTitle: string;
  subtitle: string;
  introLines: [string, string];
  quietNote: string;
  utilityNotes: [string, string];
  lunchHoursLabel: string;
  lunchHours: string;
  commonPrice: string | null;
  phone: string;
  whatsapp: string | null;
  address: string;
  mapUrl: string;
  mainPath: string;
  posterPath: string;
  lunchItems: LunchItem[];
};

// Edit this file for weekly lunch updates: hours, prices, contacts, and items.
export const lunchContent = {
  eyebrow: "დღის კომბოები",
  pageTitle: "Business Lunch",
  subtitle: "სწრაფი ლანჩი სამუშაო დღისთვის",
  introLines: [
    "შეუკვეთე წინასწარ. ან მოდი პირდაპირ.",
    "მიირთვი აქ — ან წაიღე თან.",
  ],
  quietNote: "ჩვენ არ ვართულებთ — დღე ისედაც საკმარისად რთულია.",
  utilityNotes: [
    "წინასწარი შეკვეთა = ნაკლები ლოდინი",
    "მიირთვი აქ ან წაიღე თან — როგორც დღეს გაწყობს.",
  ],
  lunchHoursLabel: "ლანჩი",
  lunchHours: "12:00–16:00",
  commonPrice: "18 ₾",
  phone: "+995 555 12 34 56",
  whatsapp: "+995 555 12 34 56",
  address: "თბილისი, მისამართი ჩასაწერია 12",
  mapUrl: "https://maps.google.com/?q=Tbilisi",
  mainPath: "/",
  posterPath: "/poster",
  lunchItems: [
    {
      id: "wings",
      number: "01",
      name: "ქათმის პანირებული ფრთები",
      includes: "მჟავე კომბოსტო • პური • საწებელი • კოლა",
    },
    {
      id: "pork-family-style",
      number: "02",
      name: "ღორის ოჯახური",
      includes:
        "საწებელი • კიტრი-პომიდვრის სალათი • კიტრის მჟავე • ლიმონათი",
    },
    {
      id: "cutlet",
      number: "03",
      name: "კატლეტი",
      includes:
        "პიურე • კიტრი-პომიდვრის სალათი • საწებელი • პური • კოკა-კოლა",
    },
    {
      id: "beans",
      number: "04",
      name: "ლობიო",
      includes: "მჭადი • ყველი • მჟავე • ლიმონათი",
    },
    {
      id: "imeruli-khachapuri",
      number: "05",
      name: "იმერული ხაჭაპური",
      includes: "კარტოფილი ფრი • კეტჩუპი • კოკა-კოლა",
    },
    {
      id: "lobiani",
      number: "06",
      name: "ლობიანი",
      includes: "მჟავე წიწაკა • ბადრიჯანი ნიგვზით • კოკა-კოლა",
    },
    {
      id: "chicken-leg",
      number: "07",
      name: "ქათმის ბარკალი",
      includes: "მწვანე სალათი • ყველი • პური • კოკა-კოლა",
    },
  ],
} satisfies LunchContent;
