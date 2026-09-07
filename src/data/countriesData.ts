// ============================================================================
// Jopi App International Country Codes Database (Comprehensive Edition - All Countries A-Z)
// ============================================================================

export interface Country {
  name: string;
  nameAr?: string;
  code: string;      // ISO Code
  dialCode: string;  // Calling Code
  flag: string;      // Flag Emoji
}

export const COUNTRIES_LIST: Country[] = [
  { name: 'Afghanistan', nameAr: 'أفغانستان', code: 'AF', dialCode: '+93', flag: '🇦🇫' },
  { name: 'Albania', nameAr: 'ألبانيا', code: 'AL', dialCode: '+355', flag: '🇦🇱' },
  { name: 'Algeria', nameAr: 'الجزائر', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Andorra', nameAr: 'أندورا', code: 'AD', dialCode: '+376', flag: '🇦🇩' },
  { name: 'Angola', nameAr: 'أنغولا', code: 'AO', dialCode: '+244', flag: '🇦🇴' },
  { name: 'Argentina', nameAr: 'الأرجنتين', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'Armenia', nameAr: 'أرمينيا', code: 'AM', dialCode: '+374', flag: '🇦🇲' },
  { name: 'Australia', nameAr: 'أستراليا', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Austria', nameAr: 'النمسا', code: 'AT', dialCode: '+43', flag: '🇦🇹' },
  { name: 'Azerbaijan', nameAr: 'أذربيجان', code: 'AZ', dialCode: '+994', flag: '🇦🇿' },
  { name: 'Bahrain', nameAr: 'البحرين', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Bangladesh', nameAr: 'بنغلاديش', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Belarus', nameAr: 'بيلاروسيا', code: 'BY', dialCode: '+375', flag: '🇧🇾' },
  { name: 'Belgium', nameAr: 'بلجيكا', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
  { name: 'Brazil', nameAr: 'البرازيل', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Canada', nameAr: 'كندا', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'China', nameAr: 'الصين', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Denmark', nameAr: 'الدنمارك', code: 'DK', dialCode: '+45', flag: '🇩🇰' },
  { name: 'Egypt', nameAr: 'مصر', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Finland', nameAr: 'فنلندا', code: 'FI', dialCode: '+358', flag: '🇫🇮' },
  { name: 'France', nameAr: 'فرنسا', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Germany', nameAr: 'ألمانيا', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'India', nameAr: 'الهند', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', nameAr: 'إندونيسيا', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Iraq', nameAr: 'العراق', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
  { name: 'Italy', nameAr: 'إيطاليا', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Japan', nameAr: 'اليابان', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'Jordan', nameAr: 'الأردن', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
  { name: 'Kuwait', nameAr: 'الكويت', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Lebanon', nameAr: 'لبنان', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
  { name: 'Libya', nameAr: 'ليبيا', code: 'LY', dialCode: '+218', flag: '🇱🇾' },
  { name: 'Malaysia', nameAr: 'ماليزيا', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Morocco', nameAr: 'المغرب', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Netherlands', nameAr: 'هولندا', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Norway', nameAr: 'النرويج', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
  { name: 'Oman', nameAr: 'عمان', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Pakistan', nameAr: 'باكستان', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Palestine', nameAr: 'فلسطين', code: 'PS', dialCode: '+970', flag: '🇵🇸' },
  { name: 'Qatar', nameAr: 'قطر', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Russia', nameAr: 'روسيا', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
  { name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Singapore', nameAr: 'سنغافورة', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'South Korea', nameAr: 'كوريا الجنوبية', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'Spain', nameAr: 'إسبانيا', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Sudan', nameAr: 'السودان', code: 'SD', dialCode: '+249', flag: '🇸🇩' },
  { name: 'Sweden', nameAr: 'السويد', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'Switzerland', nameAr: 'سويسرا', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
  { name: 'Syria', nameAr: 'سوريا', code: 'SY', dialCode: '+963', flag: '🇸🇾' },
  { name: 'Tunisia', nameAr: 'تونس', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'Turkey', nameAr: 'تركيا', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'United Kingdom', nameAr: 'المملكة المتحدة', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Yemen', nameAr: 'اليمن', code: 'YE', dialCode: '+967', flag: '🇾🇪' }
].sort((a, b) => a.name.localeCompare(b.name)); // ترتيب تلقائي دقيق من A إلى Z