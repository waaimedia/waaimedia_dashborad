export interface ContactInfo {
  phonePrimary: string;
  phoneSecondary: string;
  phoneThird: string;
  officialEmail: string;
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
  whatsapp: string;
  address: string;
  googleMapsUrl: string;
}

export const EMPTY_CONTACT_INFO: ContactInfo = {
  phonePrimary: '',
  phoneSecondary: '',
  phoneThird: '',
  officialEmail: '',
  facebook: '',
  instagram: '',
  youtube: '',
  linkedin: '',
  tiktok: '',
  whatsapp: '',
  address: '',
  googleMapsUrl: '',
};
