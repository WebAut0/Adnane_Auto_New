/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number; // in DHS
  km: number;
  fuel: 'Diesel' | 'Essence' | 'Hybride' | 'Electrique';
  transmission: 'Automatique' | 'Manuelle';
  type: 'SUV' | 'Sedan' | 'Hatchback';
  condition: 'Excellent' | 'Très bon' | 'Bon';
  color: string;
  images: string[];
  video?: string;
  specs: {
    engine: string;
    horsepower: string;
    fiscalPower: string;
    doors: number;
    seats: number;
  };
  features: string[];
  descriptionAr: string;
  descriptionFr: string;
}

export interface SellRequest {
  id: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  priceRequested: number;
  condition: string;
  phone: string;
  city: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  images?: string[];
  video?: string;
  requestType?: 'Sale' | 'Reprise';
  targetCarId?: string;
  targetCarName?: string;
  phoneVerified?: boolean;
}

export interface FinanceRequest {
  id: string;
  carId: string;
  carName: string;
  carPrice: number;
  downPayment: number;
  durationMonths: number;
  monthlyPayment: number;
  name: string;
  phone: string;
  status: 'Pending' | 'Contacted' | 'Approved';
  createdAt: string;
}

export interface Appointment {
  id: string;
  carId: string;
  carName: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface AlertRequest {
  id: string;
  brand: string;
  phone: string;
  status: 'Pending' | 'Contacted';
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  city: string;
  rating: number;
  commentAr: string;
  commentFr: string;
  avatar: string;
  replyAr?: string;
  replyFr?: string;
  repliedAt?: string;
  likesCount?: number;
  isPinned?: boolean;
  isVerifiedCustomer?: boolean;
  createdAt?: string;
}

export const initialReviews: Review[] = [
  {
    id: '1',
    name: 'أحمد التازي',
    city: 'مراكش',
    rating: 5,
    commentAr: 'تجربة ممتازة مع عدنان أوتو! اشتريت سيارة مرسيدس في حالة رائعة وتكفلوا بكل الإجراءات بسرعة واحترافية.',
    commentFr: 'Excellente expérience avec Adnane Auto ! J\'ai acheté une Mercedes en parfait état, ils se sont occupés de tout rapidement.',
    avatar: '',
    replyAr: 'نشكرك جزيل الشكر أخانا الكريم أحمد على ثقتك الغالية في معرضنا بمراكش، ويسعدنا دائماً تقديم أفضل خدمة لكم!',
    replyFr: 'Merci infiniment M. Ahmed pour votre confiance ! Nous sommes ravis de vous avoir servi au showroom.',
    repliedAt: '2026-07-20',
    likesCount: 12,
    isPinned: true,
    isVerifiedCustomer: true,
    createdAt: '2026-07-18'
  },
  {
    id: '2',
    name: 'سارة العلمي',
    city: 'مراكش',
    rating: 5,
    commentAr: 'قمت باستبدال سيارتي القديمة بسيارة تيجوان. التقييم كان عادلاً والخدمة سريعة جداً. أنصح بهم بشدة!',
    commentFr: 'J\'ai échangé mon ancienne voiture contre un Tiguan. L\'évaluation était très juste et le service ultra rapide. Je recommande vivement !',
    avatar: '',
    replyAr: 'شكراً لك سيدة سارة على تعاملك معنا ونبارك لك السيارة الجديدة، سعداء بتقديم خدمة الاستبدال بأفضل الشروط!',
    replyFr: 'Merci Mme Sara pour votre confiance et félicitations pour la nouvelle voiture !',
    repliedAt: '2026-07-21',
    likesCount: 8,
    isPinned: false,
    isVerifiedCustomer: true,
    createdAt: '2026-07-19'
  },
  {
    id: '3',
    name: 'ياسين بنجلون',
    city: 'الدار البيضاء',
    rating: 4,
    commentAr: 'خدمة زبائن ممتازة وهناك وضوح تام في حالة السيارة. المعرض نظيف والسيارات المعروضة ممتازة.',
    commentFr: 'Excellent service client et transparence totale sur l\'état de la voiture. Le showroom est propre et les voitures proposées sont superbes.',
    avatar: '',
    replyAr: 'يسعدنا جداً انطباعكم الطيب أخي ياسين، ونسعى دائماً للحفاظ على أعلى معايير الجودة والشفافية مع كافة عملائنا الكرام.',
    replyFr: 'Ravi de votre satisfaction M. Yassine ! Nous veillons toujours à la transparence.',
    repliedAt: '2026-07-22',
    likesCount: 5,
    isPinned: false,
    isVerifiedCustomer: true,
    createdAt: '2026-07-21'
  }
];

export const initialCars: Car[] = [
  {
    id: '1',
    brand: 'Mercedes',
    model: 'Classe C 220d',
    year: 2017,
    price: 220000,
    km: 130000,
    fuel: 'Diesel',
    transmission: 'Automatique',
    type: 'Sedan',
    condition: 'Excellent',
    color: 'Gris Métallisé',
    images: [
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      engine: '2.2L 4-Cylindres',
      horsepower: '170 ch',
      fiscalPower: '8 CV',
      doors: 4,
      seats: 5
    },
    features: [
      'Toit ouvrant panoramique',
      'Intérieur cuir marron premium',
      'Jantes aluminium AMG 18"',
      'Caméra de recul 360°',
      'Système audio Burmester',
      'GPS Maroc préinstallé',
      'Aide au stationnement automatique',
      'Régulateur de vitesse adaptatif'
    ],
    descriptionAr: 'سيارة مرسيدس كلاس سي 220 دي في حالة ممتازة جداً. صيانة منتظمة، طلاء أصلي بالكامل، مجهزة بجميع الخيارات الفاخرة (AMG line). مثالية لمحبي الراحة والفخامة.',
    descriptionFr: 'Mercedes Classe C 220d en excellent état général. Entretien régulier maison, peinture d\'origine, toutes options (Pack AMG). Confort, élégance et puissance réunis.'
  },
  {
    id: '2',
    brand: 'Volkswagen',
    model: 'Tiguan 2.0 TDI',
    year: 2016,
    price: 185000,
    km: 140000,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    type: 'SUV',
    condition: 'Très bon',
    color: 'Bronze/Gold',
    images: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      engine: '2.0L TDI',
      horsepower: '143 ch',
      fiscalPower: '7 CV',
      doors: 5,
      seats: 5
    },
    features: [
      'Toit panoramique ouvrant',
      'Ecran tactile avec Apple CarPlay / Android Auto',
      'Climatisation automatique tri-zone',
      'Radars de recul avant/arrière',
      'Rétroviseurs électriques rabattables',
      'Jantes alliage 17"'
    ],
    descriptionAr: 'فولكس فاجن تيجوان مريحة وقوية، مثالية للعائلات. صيانة مستمرة، اقتصادية في استهلاك الوقود مع ناقل حركة يدوي سلس. سيارة موثوقة جداً للطرق الطويلة والمدينة.',
    descriptionFr: 'Volkswagen Tiguan confortable et robuste, parfait pour la famille. Très bien entretenu, consommation très raisonnable avec boîte manuelle agréable. Prêt pour toutes distances.'
  },
  {
    id: '3',
    brand: 'Seat',
    model: 'Leon FR',
    year: 2018,
    price: 175000,
    km: 110000,
    fuel: 'Diesel',
    transmission: 'Automatique',
    type: 'Hatchback',
    condition: 'Excellent',
    color: 'Blanc Nacré',
    images: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      engine: '2.0L TDI',
      horsepower: '150 ch',
      fiscalPower: '7 CV',
      doors: 5,
      seats: 5
    },
    features: [
      'Pack sport FR complet',
      'Feux Full LED Technology',
      'Cockpit digital moderne',
      'Modes de conduite adaptatifs',
      'Éclairage d\'ambiance LED multicolore',
      'Jantes sport 18" FR',
      'Caméra de recul'
    ],
    descriptionAr: 'سيات ليون إف آر رياضية وجذابة. لون أبيض لؤلؤي ساحر، ناقل حركة أوتوماتيكي DSG سريع، محرك قوي واقتصادي. خيار ممتاز للشباب ومحبي القيادة الرياضية.',
    descriptionFr: 'Seat Leon FR au design sportif affirmé. Magnifique blanc nacré, boîte automatique DSG rapide et efficace, moteur puissant et économique. Un régal à conduire.'
  },
  {
    id: '4',
    brand: 'Kia',
    model: 'Sportage Active',
    year: 2015,
    price: 135000,
    km: 150000,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    type: 'SUV',
    condition: 'Très bon',
    color: 'Gris Anthracite',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      engine: '1.7L CRDI',
      horsepower: '115 ch',
      fiscalPower: '6 CV',
      doors: 5,
      seats: 5
    },
    features: [
      'Climatisation automatique',
      'Feux de jour LED',
      'Caméra de recul intégrée',
      'Régulateur/Limiteur de vitesse',
      'Bluetooth & USB',
      'Jantes alliage 17"'
    ],
    descriptionAr: 'كيا سبورتيج في حالة ممتازة، سيارة دفع رباعي عملية وموثوقة للغاية. محرك ديزل 1.7 لتر اقتصادي وضريبة سنوية منخفضة (600 درهم). صيانة كاملة وجاهزة للاستخدام.',
    descriptionFr: 'Kia Sportage en très bon état, SUV pratique et d\'une fiabilité légendaire. Moteur diesel 1.7 économique avec une vignette annuelle très faible. Prête à rouler sans frais.'
  },
  {
    id: '5',
    brand: 'Hyundai',
    model: 'Tucson Luxury',
    year: 2019,
    price: 210000,
    km: 85000,
    fuel: 'Diesel',
    transmission: 'Automatique',
    type: 'SUV',
    condition: 'Excellent',
    color: 'Noir Intense',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      engine: '2.0L CRDi',
      horsepower: '185 ch',
      fiscalPower: '8 CV',
      doors: 5,
      seats: 5
    },
    features: [
      'Double toit ouvrant panoramique',
      'Intérieur en cuir noir',
      'Sièges électriques chauffants',
      'Entrée/Démarrage sans clé',
      'Caméra de recul & Radars 360°',
      'Coffre électrique'
    ],
    descriptionAr: 'هيونداي توسان لوكسوري موديل 2019 ممشى قليل 85 ألف كيلومتر فقط. سيارة فخمة جداً وعائلية بامتياز مع كامل كماليات الرفاهية والأمان.',
    descriptionFr: 'Hyundai Tucson Luxury modèle 2019 avec seulement 85 000 km. Véhicule spacieux, confortable et suréquipé. Idéal pour les familles exigeantes.'
  },
  {
    id: '6',
    brand: 'Peugeot',
    model: '208 Signature',
    year: 2018,
    price: 112000,
    km: 95000,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    type: 'Hatchback',
    condition: 'Très bon',
    color: 'Bleu Récife',
    images: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      engine: '1.6L BlueHDi',
      horsepower: '92 ch',
      fiscalPower: '6 CV',
      doors: 5,
      seats: 5
    },
    features: [
      'Ecran multimédia tactile',
      'Climatisation automatique',
      'Limiteur et régulateur de vitesse',
      'Radars de recul',
      'Volant en cuir multifonctions'
    ],
    descriptionAr: 'بيجو 208 سيغناتور محرك ديزل ممتاز واقتصادي جداً في استهلاك الوقود. مناسبة جداً للاستخدام اليومي داخل المدينة وسهلة الركن.',
    descriptionFr: 'Peugeot 208 Signature avec un moteur diesel extrêmement économique et robuste. Parfaitement adaptée à un usage citadin et quotidien.'
  },
  {
    id: '7',
    brand: 'Renault',
    model: 'Clio 4 Intens',
    year: 2017,
    price: 105000,
    km: 120000,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    type: 'Hatchback',
    condition: 'Très bon',
    color: 'Rouge Flamme',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      engine: '1.5L dCi',
      horsepower: '90 ch',
      fiscalPower: '6 CV',
      doors: 5,
      seats: 5
    },
    features: [
      'Démarrage carte mains-libres',
      'Projecteurs Full LED Pure Vision',
      'GPS Système MediaNav Maroc',
      'Climatisation automatique',
      'Jantes alliage 16" diamantées'
    ],
    descriptionAr: 'رينو كليو 4 إنتنس اللون الأحمر الشهير. سيارة أنيقة واقتصادية لأبعد الحدود. صيانة كاملة وقطع غيار متوفرة واقتصادية.',
    descriptionFr: 'Renault Clio 4 Intens en magnifique rouge flamme. Équipements de pointe, faible consommation historique et entretien très économique.'
  },
  {
    id: '8',
    brand: 'Dacia',
    model: 'Duster Prestige',
    year: 2019,
    price: 145000,
    km: 80000,
    fuel: 'Diesel',
    transmission: 'Manuelle',
    type: 'SUV',
    condition: 'Excellent',
    color: 'Orange Atacama',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
    ],
    specs: {
      engine: '1.5L dCi',
      horsepower: '110 ch',
      fiscalPower: '6 CV',
      doors: 5,
      seats: 5
    },
    features: [
      'Système caméra multivues (4 caméras)',
      'Avertisseur d\'angle mort',
      'MediaNav tactile 7" Maroc',
      'Climatisation automatique',
      'Carte d\'accès mains libres'
    ],
    descriptionAr: 'داسيا دوستر بريستيج أعلى فئة، موديل 2019. سيارة مرتفعة وممتازة للشوارع والطرق غير المعبدة في المغرب. صيانة مستمرة بالوكالة.',
    descriptionFr: 'Dacia Duster Prestige haut de gamme, millésime 2019. Idéal pour les routes marocaines et les chemins de campagne. Entretien exclusif maison.'
  }
];
