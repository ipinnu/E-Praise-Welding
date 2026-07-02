export const contactEmail = "info@epraisewelding.com";
export const contactPhoneDisplay = "0905 449 2490";
export const contactPhoneE164 = "+2349054492490";
export const whatsappNumber = "2349054492490";

export const whatsappDefaultMessage =
  "Hello E-Praise Welding, I'd like to enquire about your welding services.";

export function whatsappUrl(message = whatsappDefaultMessage) {
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${whatsappNumber}${params}`;
}

export const contactHours = {
  weekday: "Mon–Fri: 7AM – 6PM",
  saturday: "Sat: 8AM – 2PM",
  sunday: "Sun: Closed",
};
