/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Globe, Shield, Heart, MapPin, Phone, Mail, Clock, Calendar, DollarSign, 
  Sparkles, SlidersHorizontal, BookOpen, Star, HelpCircle, ArrowRightLeft, ThumbsUp, CheckCircle, Info, ShieldCheck, MessageSquare
} from 'lucide-react';
import { initialCars, initialReviews, Car, SellRequest, FinanceRequest, Appointment, Review, AlertRequest } from './data/mockCars';
import { translations } from './data/translations';
import AIAdvisor from './components/AIAdvisor';
import TrelloLogin from './components/TrelloLogin';
import CMSDashboard from './components/CMSDashboard';
import CarDetails from './components/CarDetails';
import CompareModal from './components/CompareModal';
import PhoneVerifyModal from './components/PhoneVerifyModal';
import { VisitorReviewsSection } from './components/VisitorReviewsSection';
import { BrandLogo } from './components/BrandLogo';

export default function App() {
  // Localization state
  const [lang, setLang] = useState<'ar' | 'fr'>('ar');
  const t = translations[lang];

  // Routing / Tab States
  // 'home' | 'catalog' | 'car-details' | 'sell' | 'about' | 'services' | 'customers' | 'contact' | 'login' | 'cms'
  const [currentTab, setCurrentTab] = useState<'home' | 'catalog' | 'sell' | 'about' | 'services' | 'customers' | 'contact' | 'login' | 'cms'>('home');
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  // Core Mutable States (initialized with localStorage)
  const [cars, setCars] = useState<Car[]>([]);
  const availableBrands = cars.length > 0
    ? Array.from(new Set(cars.map(c => c.brand))).filter(Boolean).sort()
    : ['Mercedes', 'Volkswagen', 'Hyundai', 'Peugeot', 'Renault', 'Kia', 'Dacia', 'Seat'];

  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [financeRequests, setFinanceRequests] = useState<FinanceRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<AlertRequest[]>([]);

  // Selection states for modal triggers
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Search & Filters State
  const [searchBrand, setSearchBrand] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPrice, setFilterPrice] = useState<number>(300000);
  const [filterFuel, setFilterFuel] = useState<string>('all');
  const [filterTransmission, setFilterTransmission] = useState<string>('all');

  // Interactive Form States
  // Sell & Trade-in (Reprise) Form
  const [sellRequestType, setSellRequestType] = useState<'Sale' | 'Reprise'>('Sale');
  const [sellTargetCarId, setSellTargetCarId] = useState<string>('');
  const [sellPhoneVerified, setSellPhoneVerified] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [pendingFormSubmit, setPendingFormSubmit] = useState<(() => void) | null>(null);

  const [sellBrand, setSellBrand] = useState('');
  const [sellModel, setSellModel] = useState('');
  const [sellYear, setSellYear] = useState<number>(2018);
  const [sellKm, setSellKm] = useState<number>(80000);
  const [sellPrice, setSellPrice] = useState<number>(120000);
  const [sellCondition, setSellCondition] = useState('Excellent');
  const [sellPhone, setSellPhone] = useState('');
  const [sellCity, setSellCity] = useState('Marrakech');
  const [sellImages, setSellImages] = useState<string[]>([]);
  const [sellVideo, setSellVideo] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Appointment Form
  const [appDate, setAppDate] = useState('');
  const [appTime, setAppTime] = useState('10:00');
  const [appName, setAppName] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appCarId, setAppCarId] = useState('');

  // Financing Calculator Form
  const [calcCarId, setCalcCarId] = useState('');
  const [calcPrice, setCalcPrice] = useState<number>(150000);
  const [calcDownPayment, setCalcDownPayment] = useState<number>(30000);
  const [calcDuration, setCalcDuration] = useState<number>(48);
  const [calcInterestRate, setCalcInterestRate] = useState<number>(5.5);
  const [calcName, setCalcName] = useState('');
  const [calcPhone, setCalcPhone] = useState('');

  // Custom alert subscription state (advanced idea)
  const [alertPrefBrand, setAlertPrefBrand] = useState('');
  const [alertPrefPrice, setAlertPrefPrice] = useState(200000);
  const [alertPrefPhone, setAlertPrefPhone] = useState('');

  // Review submissions
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  // Showroom Information States
  const [showroomAddressAr, setShowroomAddressAr] = useState(() => 
    localStorage.getItem('showroom_address_ar') || "المسيرة 2 - عنبر، قطاع 028154، محل رقم 4، عملية عنبر 3، مراكش، 40000"
  );
  const [showroomAddressFr, setShowroomAddressFr] = useState(() => 
    localStorage.getItem('showroom_address_fr') || "Massira 2 - Anbar, Secteur 028154, local N°4, Opération Anbar 3, Marrakech, 40000"
  );
  const [showroomPhone, setShowroomPhone] = useState(() => 
    localStorage.getItem('showroom_phone') || "+212 672 60 16 78"
  );
  const [showroomWorkHoursAr, setShowroomWorkHoursAr] = useState(() => 
    localStorage.getItem('showroom_hours_ar') || "الإثنين - السبت: 9:00 صباحاً - 8:00 مساءً (الأحد مغلق)"
  );
  const [showroomWorkHoursFr, setShowroomWorkHoursFr] = useState(() => 
    localStorage.getItem('showroom_hours_fr') || "Lundi - Samedi : 09:00 - 20:00 (Dimanche fermé)"
  );
  const [showroomMapTitle, setShowroomMapTitle] = useState(() => 
    localStorage.getItem('showroom_map_title') || "Marrakech - Massira 2 Anbar"
  );
  const [showroomMapDesc, setShowroomMapDesc] = useState(() => 
    localStorage.getItem('showroom_map_desc') || "Sector 028154, Shop N°4, Operation Anbar 3"
  );
  const [showroomMapUrl, setShowroomMapUrl] = useState(() => 
    localStorage.getItem('showroom_map_url') || "https://maps.google.com/?q=Massira+2+Anbar+Marrakech"
  );
  const [showroomEmail, setShowroomEmail] = useState(() => 
    localStorage.getItem('showroom_email') || "adnaneauto@gmail.com"
  );
  const [showroomWhatsApp, setShowroomWhatsApp] = useState(() => 
    localStorage.getItem('showroom_whatsapp') || "+212 672 60 16 78"
  );
  const [showroomFacebook, setShowroomFacebook] = useState(() => 
    localStorage.getItem('showroom_facebook') || "https://facebook.com/AdnaneAuto"
  );
  const [showroomInstagram, setShowroomInstagram] = useState(() => 
    localStorage.getItem('showroom_instagram') || "https://instagram.com/AdnaneAuto"
  );
  const [showroomBrandNameAr, setShowroomBrandNameAr] = useState(() => 
    localStorage.getItem('showroom_brand_name_ar') || "عدنان أوتو"
  );
  const [showroomBrandNameFr, setShowroomBrandNameFr] = useState(() => 
    localStorage.getItem('showroom_brand_name_fr') || "Adnane Auto"
  );
  const [showroomHeroTitleAr, setShowroomHeroTitleAr] = useState(() => 
    localStorage.getItem('showroom_hero_title_ar') || "اعثر على سيارتك المثالية في مراكش"
  );
  const [showroomHeroTitleFr, setShowroomHeroTitleFr] = useState(() => 
    localStorage.getItem('showroom_hero_title_fr') || "Trouvez votre voiture idéale à Marrakech"
  );
  const [showroomHeroSubtitleAr, setShowroomHeroSubtitleAr] = useState(() => 
    localStorage.getItem('showroom_hero_subtitle_ar') || "معرض Adnane Auto يقدم تشكيلة واسعة من السيارات المستعملة الموثوقة مع إمكانية التبديل (Reprise)"
  );
  const [showroomHeroSubtitleFr, setShowroomHeroSubtitleFr] = useState(() => 
    localStorage.getItem('showroom_hero_subtitle_fr') || "Le showroom Adnane Auto propose une large sélection de voitures d'occasion de confiance avec option de reprise."
  );
  const [showroomSloganAr, setShowroomSloganAr] = useState(() => 
    localStorage.getItem('showroom_slogan_ar') || "بيع، شراء، واستبدال السيارات المستعملة في مراكش"
  );
  const [showroomSloganFr, setShowroomSloganFr] = useState(() => 
    localStorage.getItem('showroom_slogan_fr') || "Vente, achat, et reprise de voitures d'occasion à Marrakech"
  );
  const [showroomLogoUrl, setShowroomLogoUrl] = useState(() => 
    localStorage.getItem('showroom_custom_logo') || ""
  );

  const handleUpdateShowroomInfo = (updates: {
    addressAr?: string;
    addressFr?: string;
    phone?: string;
    workHoursAr?: string;
    workHoursFr?: string;
    mapTitle?: string;
    mapDesc?: string;
    mapUrl?: string;
    email?: string;
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    brandNameAr?: string;
    brandNameFr?: string;
    heroTitleAr?: string;
    heroTitleFr?: string;
    heroSubtitleAr?: string;
    heroSubtitleFr?: string;
    sloganAr?: string;
    sloganFr?: string;
    customLogoUrl?: string;
  }) => {
    if (updates.customLogoUrl !== undefined) {
      setShowroomLogoUrl(updates.customLogoUrl);
      if (updates.customLogoUrl) {
        localStorage.setItem('showroom_custom_logo', updates.customLogoUrl);
      } else {
        localStorage.removeItem('showroom_custom_logo');
      }
      window.dispatchEvent(new Event('showroom_logo_updated'));
    }
    if (updates.addressAr !== undefined) {
      setShowroomAddressAr(updates.addressAr);
      localStorage.setItem('showroom_address_ar', updates.addressAr);
    }
    if (updates.addressFr !== undefined) {
      setShowroomAddressFr(updates.addressFr);
      localStorage.setItem('showroom_address_fr', updates.addressFr);
    }
    if (updates.phone !== undefined) {
      setShowroomPhone(updates.phone);
      localStorage.setItem('showroom_phone', updates.phone);
    }
    if (updates.workHoursAr !== undefined) {
      setShowroomWorkHoursAr(updates.workHoursAr);
      localStorage.setItem('showroom_hours_ar', updates.workHoursAr);
    }
    if (updates.workHoursFr !== undefined) {
      setShowroomWorkHoursFr(updates.workHoursFr);
      localStorage.setItem('showroom_hours_fr', updates.workHoursFr);
    }
    if (updates.mapTitle !== undefined) {
      setShowroomMapTitle(updates.mapTitle);
      localStorage.setItem('showroom_map_title', updates.mapTitle);
    }
    if (updates.mapDesc !== undefined) {
      setShowroomMapDesc(updates.mapDesc);
      localStorage.setItem('showroom_map_desc', updates.mapDesc);
    }
    if (updates.mapUrl !== undefined) {
      setShowroomMapUrl(updates.mapUrl);
      localStorage.setItem('showroom_map_url', updates.mapUrl);
    }
    if (updates.email !== undefined) {
      setShowroomEmail(updates.email);
      localStorage.setItem('showroom_email', updates.email);
    }
    if (updates.whatsapp !== undefined) {
      setShowroomWhatsApp(updates.whatsapp);
      localStorage.setItem('showroom_whatsapp', updates.whatsapp);
    }
    if (updates.facebook !== undefined) {
      setShowroomFacebook(updates.facebook);
      localStorage.setItem('showroom_facebook', updates.facebook);
    }
    if (updates.instagram !== undefined) {
      setShowroomInstagram(updates.instagram);
      localStorage.setItem('showroom_instagram', updates.instagram);
    }
    if (updates.brandNameAr !== undefined) {
      setShowroomBrandNameAr(updates.brandNameAr);
      localStorage.setItem('showroom_brand_name_ar', updates.brandNameAr);
    }
    if (updates.brandNameFr !== undefined) {
      setShowroomBrandNameFr(updates.brandNameFr);
      localStorage.setItem('showroom_brand_name_fr', updates.brandNameFr);
    }
    if (updates.heroTitleAr !== undefined) {
      setShowroomHeroTitleAr(updates.heroTitleAr);
      localStorage.setItem('showroom_hero_title_ar', updates.heroTitleAr);
    }
    if (updates.heroTitleFr !== undefined) {
      setShowroomHeroTitleFr(updates.heroTitleFr);
      localStorage.setItem('showroom_hero_title_fr', updates.heroTitleFr);
    }
    if (updates.heroSubtitleAr !== undefined) {
      setShowroomHeroSubtitleAr(updates.heroSubtitleAr);
      localStorage.setItem('showroom_hero_subtitle_ar', updates.heroSubtitleAr);
    }
    if (updates.heroSubtitleFr !== undefined) {
      setShowroomHeroSubtitleFr(updates.heroSubtitleFr);
      localStorage.setItem('showroom_hero_subtitle_fr', updates.heroSubtitleFr);
    }
    if (updates.sloganAr !== undefined) {
      setShowroomSloganAr(updates.sloganAr);
      localStorage.setItem('showroom_slogan_ar', updates.sloganAr);
    }
    if (updates.sloganFr !== undefined) {
      setShowroomSloganFr(updates.sloganFr);
      localStorage.setItem('showroom_slogan_fr', updates.sloganFr);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const magicToken = urlParams.get('magic_token');
    if (magicToken) {
      localStorage.setItem('adnane_admin_token', magicToken);
      setCurrentTab('cms');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const storedCars = localStorage.getItem('adnane_cars');
    if (storedCars) {
      setCars(JSON.parse(storedCars));
    } else {
      setCars(initialCars);
      localStorage.setItem('adnane_cars', JSON.stringify(initialCars));
    }

    const storedSells = localStorage.getItem('adnane_sell_requests');
    if (storedSells) {
      setSellRequests(JSON.parse(storedSells));
    } else {
      const initialSells: SellRequest[] = [
        {
          id: 's1',
          brand: 'Peugeot',
          model: '308 Allure',
          year: 2016,
          km: 120000,
          priceRequested: 110000,
          condition: 'Très bon',
          phone: '+212 612 34 56 78',
          city: 'Marrakech',
          status: 'Pending',
          createdAt: new Date().toLocaleDateString()
        }
      ];
      setSellRequests(initialSells);
      localStorage.setItem('adnane_sell_requests', JSON.stringify(initialSells));
    }

    const storedFinances = localStorage.getItem('adnane_finance_requests');
    if (storedFinances) {
      setFinanceRequests(JSON.parse(storedFinances));
    } else {
      const initialFinances: FinanceRequest[] = [
        {
          id: 'f1',
          carId: '1',
          carName: 'Mercedes Classe C 220d',
          carPrice: 220000,
          downPayment: 50000,
          durationMonths: 60,
          monthlyPayment: 3450,
          name: 'بدر الداودي',
          phone: '+212 699 88 77 66',
          status: 'Pending',
          createdAt: new Date().toLocaleDateString()
        }
      ];
      setFinanceRequests(initialFinances);
      localStorage.setItem('adnane_finance_requests', JSON.stringify(initialFinances));
    }

    const storedApps = localStorage.getItem('adnane_appointments');
    if (storedApps) {
      setAppointments(JSON.parse(storedApps));
    } else {
      const initialApps: Appointment[] = [
        {
          id: 'a1',
          carId: '2',
          carName: 'Volkswagen Tiguan 2.0 TDI',
          date: '2026-07-25',
          time: '11:00',
          name: 'سمير الوردي',
          phone: '+212 655 44 33 22',
          status: 'Scheduled',
          createdAt: new Date().toLocaleDateString()
        }
      ];
      setAppointments(initialApps);
      localStorage.setItem('adnane_appointments', JSON.stringify(initialApps));
    }

    const storedReviews = localStorage.getItem('adnane_reviews');
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    } else {
      setReviews(initialReviews);
      localStorage.setItem('adnane_reviews', JSON.stringify(initialReviews));
    }

    const storedFavs = localStorage.getItem('adnane_favorites');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }

    const storedAlerts = localStorage.getItem('adnane_alerts');
    if (storedAlerts) {
      setAlerts(JSON.parse(storedAlerts));
    } else {
      const initialAlerts: AlertRequest[] = [
        {
          id: 'al1',
          brand: 'Mercedes Class C',
          phone: '+212 612 34 56 78',
          status: 'Pending',
          createdAt: new Date().toLocaleDateString()
        }
      ];
      setAlerts(initialAlerts);
      localStorage.setItem('adnane_alerts', JSON.stringify(initialAlerts));
    }
  }, []);

  // Sync state functions
  const handleUpdateCars = (newCars: Car[]) => {
    setCars(newCars);
    localStorage.setItem('adnane_cars', JSON.stringify(newCars));
  };

  const handleUpdateAlerts = (newAlerts: AlertRequest[]) => {
    setAlerts(newAlerts);
    localStorage.setItem('adnane_alerts', JSON.stringify(newAlerts));
  };

  const handleUpdateSellRequests = (newSells: SellRequest[]) => {
    setSellRequests(newSells);
    localStorage.setItem('adnane_sell_requests', JSON.stringify(newSells));
  };

  const handleUpdateFinanceRequests = (newFinances: FinanceRequest[]) => {
    setFinanceRequests(newFinances);
    localStorage.setItem('adnane_finance_requests', JSON.stringify(newFinances));
  };

  const handleUpdateAppointments = (newApps: Appointment[]) => {
    setAppointments(newApps);
    localStorage.setItem('adnane_appointments', JSON.stringify(newApps));
  };

  const handleUpdateReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
    localStorage.setItem('adnane_reviews', JSON.stringify(newReviews));
  };

  const handleToggleFavorite = (id: string) => {
    const updated = favorites.includes(id) 
      ? favorites.filter(fId => fId !== id) 
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('adnane_favorites', JSON.stringify(updated));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      processFiles(filesArray);
    }
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSellImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleStartReprise = (car?: Car) => {
    setSelectedCarId(null);
    setCurrentTab('sell');
    setSellRequestType('Reprise');
    if (car) {
      setSellTargetCarId(car.id);
    } else {
      setSellTargetCarId('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeSellSubmit = () => {
    const targetCar = cars.find(c => c.id === sellTargetCarId);
    const newReq: SellRequest = {
      id: String(Date.now()),
      brand: sellBrand || 'Mercedes',
      model: sellModel,
      year: sellYear,
      km: sellKm,
      priceRequested: sellPrice,
      condition: sellCondition,
      phone: sellPhone,
      city: sellCity,
      status: 'Pending',
      createdAt: new Date().toLocaleDateString(),
      images: sellImages,
      video: sellVideo,
      requestType: sellRequestType,
      targetCarId: sellRequestType === 'Reprise' ? sellTargetCarId : undefined,
      targetCarName: sellRequestType === 'Reprise' ? (targetCar ? `${targetCar.brand} ${targetCar.model} (${targetCar.year})` : (lang === 'ar' ? 'أي سيارة متوفرة بالمعرض' : 'N\'importe quel véhicule')) : undefined,
      phoneVerified: true
    };
    handleUpdateSellRequests([newReq, ...sellRequests]);
    showBanner(sellRequestType === 'Reprise' 
      ? (lang === 'ar' ? 'تم تسجيل طلب الاستبدال (Reprise) وتوثيق الهاتف بنجاح! سيتصل بك فريقنا.' : 'Demande de reprise enregistrée et téléphone vérifié avec succès !')
      : t.sellSuccess);
    // Reset form
    setSellModel('');
    setSellPhone('');
    setSellImages([]);
    setSellVideo('');
    setSellPhoneVerified(false);
  };

  // Submit Handlers
  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellPhone || sellPhone.trim().length < 6) {
      alert(lang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح.' : 'Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    if (!sellPhoneVerified) {
      setPendingFormSubmit(() => executeSellSubmit);
      setIsPhoneModalOpen(true);
    } else {
      executeSellSubmit();
    }
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCar = cars.find(c => c.id === appCarId);
    const newApp: Appointment = {
      id: String(Date.now()),
      carId: appCarId,
      carName: selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'Visite Showroom',
      date: appDate,
      time: appTime,
      name: appName,
      phone: appPhone,
      status: 'Scheduled',
      createdAt: new Date().toLocaleDateString()
    };
    handleUpdateAppointments([newApp, ...appointments]);
    showBanner(t.bookSuccess);
    // Reset
    setAppName('');
    setAppPhone('');
    setAppDate('');
  };

  const handleFinanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCar = cars.find(c => c.id === calcCarId);
    const monthlyPayment = calculateMonthly(calcPrice, calcDownPayment, calcDuration, calcInterestRate);
    const newReq: FinanceRequest = {
      id: String(Date.now()),
      carId: calcCarId,
      carName: selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'Simulation Libre',
      carPrice: calcPrice,
      downPayment: calcDownPayment,
      durationMonths: calcDuration,
      monthlyPayment,
      name: calcName,
      phone: calcPhone,
      status: 'Pending',
      createdAt: new Date().toLocaleDateString()
    };
    handleUpdateFinanceRequests([newReq, ...financeRequests]);
    showBanner(t.financeSuccess);
    // Reset
    setCalcName('');
    setCalcPhone('');
  };

  const handleSubscribeAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: AlertRequest = {
      id: String(Date.now()),
      brand: alertPrefBrand,
      phone: alertPrefPhone,
      status: 'Pending',
      createdAt: new Date().toLocaleDateString()
    };
    handleUpdateAlerts([newAlert, ...alerts]);
    showBanner(lang === 'ar' ? 'تم تسجيل اهتمامك! سنرسل لك إشعاراً على الهاتف فور توفر سيارة مطابقة.' : 'Préférence enregistrée ! Nous vous alerterons dès qu\'un véhicule correspondant arrivera.');
    setAlertPrefBrand('');
    setAlertPrefPhone('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRev: Review = {
      id: String(Date.now()),
      name: revName,
      city: lang === 'ar' ? 'مراكش' : 'Marrakech',
      rating: revRating,
      commentAr: revComment,
      commentFr: revComment,
      avatar: ''
    };
    handleUpdateReviews([newRev, ...reviews]);
    showBanner(lang === 'ar' ? 'شكراً لتقييمك الرائع! تم النشر بنجاح.' : 'Merci pour votre excellent avis !');
    setRevName('');
    setRevComment('');
  };

  const handleAddVisitorReview = (newRevData: { name: string; city: string; rating: number; comment: string }) => {
    const newRev: Review = {
      id: String(Date.now()),
      name: newRevData.name,
      city: newRevData.city,
      rating: newRevData.rating,
      commentAr: newRevData.comment,
      commentFr: newRevData.comment,
      avatar: ''
    };
    handleUpdateReviews([newRev, ...reviews]);
    showBanner(lang === 'ar' ? 'شكراً لتقييمك وتعليقك القيم! تم النشر بنجاح.' : 'Merci pour votre commentaire ! Publié avec succès.');
  };

  const showBanner = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  // Monthly Loan Calculation helper
  const calculateMonthly = (p: number, d: number, m: number, r: number) => {
    const loanAmt = p - d;
    if (loanAmt <= 0) return 0;
    const monthlyRate = (r / 100) / 12;
    if (monthlyRate === 0) return loanAmt / m;
    return (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, m)) / (Math.pow(1 + monthlyRate, m) - 1);
  };

  const maxCatalogPrice = Math.max(...cars.map(c => c.price), 300000);

  // Filters logic
  const filteredCars = cars.filter(car => {
    const matchesBrand = searchBrand ? car.brand.toLowerCase() === searchBrand.toLowerCase() : true;
    const matchesType = filterType === 'all' ? true : car.type === filterType;
    const matchesPrice = filterPrice >= maxCatalogPrice ? true : car.price <= filterPrice;
    const matchesFuel = filterFuel === 'all' ? true : car.fuel === filterFuel;
    const matchesTransmission = filterTransmission === 'all' ? true : car.transmission === filterTransmission;
    return matchesBrand && matchesType && matchesPrice && matchesFuel && matchesTransmission;
  });

  const isRtl = lang === 'ar';

  // Toggle Language
  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'fr' : 'ar');
  };

  // Nav helper with secure session verification guard
  const navigateTo = async (tab: typeof currentTab, carId: string | null = null) => {
    if (tab === 'cms') {
      const token = localStorage.getItem('adnane_admin_token');
      if (!token) {
        setCurrentTab('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      try {
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.valid) {
          localStorage.removeItem('adnane_admin_token');
          setCurrentTab('login');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } catch (err) {
        // Safe fallback in case of connection drop
        localStorage.removeItem('adnane_admin_token');
        setCurrentTab('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setCurrentTab(tab);
    if (carId) {
      setSelectedCarId(carId);
      // Pre-populate calculators/appointments
      setAppCarId(carId);
      setCalcCarId(carId);
      const sel = cars.find(c => c.id === carId);
      if (sel) {
        setCalcPrice(sel.price);
        setCalcDownPayment(Math.round(sel.price * 0.2));
      }
    } else {
      setSelectedCarId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login handler
  const handleLoginSuccess = () => {
    setCurrentTab('cms');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Banner Notifications */}
      {successBanner && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce border border-rose-400">
          <CheckCircle className="h-5 w-5" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Main Front-End Layout (Hide for Login and CMS Dashboard) */}
      {currentTab !== 'login' && currentTab !== 'cms' ? (
        <>
          {/* Airbnb-Inspired Top Header Navigation */}
          <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              
              {/* Logo / Brand Name */}
              <div className="flex items-center gap-1.5 sm:gap-3 cursor-pointer shrink-0" onClick={() => navigateTo('home')}>
                <BrandLogo variant="original" className="h-[42px] sm:h-[54px]" />
              </div>

              {/* Navigation middle bar (Airbnb style Pill) */}
              <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 border border-gray-200/80 rounded-full px-2 py-1 xl:px-2.5 xl:py-1.5 shadow-sm hover:shadow-md transition duration-200 text-xs xl:text-sm font-bold text-gray-600 shrink-0">
                <button onClick={() => navigateTo('home')} className={`px-2.5 xl:px-4 py-1.5 xl:py-2 rounded-full cursor-pointer hover:bg-gray-50 whitespace-nowrap ${currentTab === 'home' ? 'text-rose-500 bg-rose-500/5' : ''}`}>{t.home}</button>
                <button onClick={() => navigateTo('catalog')} className={`px-2.5 xl:px-4 py-1.5 xl:py-2 rounded-full cursor-pointer hover:bg-gray-50 whitespace-nowrap ${currentTab === 'catalog' ? 'text-rose-500 bg-rose-500/5' : ''}`}>{t.catalog}</button>
                <button onClick={() => navigateTo('sell')} className={`px-2.5 xl:px-4 py-1.5 xl:py-2 rounded-full cursor-pointer hover:bg-gray-50 whitespace-nowrap ${currentTab === 'sell' ? 'text-rose-500 bg-rose-500/5' : ''}`}>{t.sell}</button>
                <button onClick={() => navigateTo('customers')} className={`px-2.5 xl:px-4 py-1.5 xl:py-2 rounded-full cursor-pointer hover:bg-gray-50 whitespace-nowrap ${currentTab === 'customers' ? 'text-rose-500 bg-rose-500/5' : ''}`}>{lang === 'ar' ? 'آراء العملاء' : 'Avis Clients'}</button>
                <button onClick={() => navigateTo('about')} className={`px-2.5 xl:px-4 py-1.5 xl:py-2 rounded-full cursor-pointer hover:bg-gray-50 whitespace-nowrap ${currentTab === 'about' ? 'text-rose-500 bg-rose-500/5' : ''}`}>{t.about}</button>
                <button onClick={() => navigateTo('contact')} className={`px-2.5 xl:px-4 py-1.5 xl:py-2 rounded-full cursor-pointer hover:bg-gray-50 whitespace-nowrap ${currentTab === 'contact' ? 'text-rose-500 bg-rose-500/5' : ''}`}>{t.contact}</button>
              </nav>

              {/* Action Buttons right side */}
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                {/* Advanced Compare trigger button */}
                <button 
                  onClick={() => setIsCompareOpen(true)}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition relative cursor-pointer"
                  title={t.compare}
                >
                  <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-rose-500 rounded-full animate-ping"></span>
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-rose-500 rounded-full"></span>
                </button>

                {/* Language switch */}
                <button 
                  onClick={toggleLanguage}
                  className="p-1.5 sm:p-2 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-rose-500 font-semibold text-[11px] sm:text-xs rounded-full flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer bg-white transition duration-200 px-2.5 py-1.5 sm:px-3 sm:py-1.5"
                >
                  <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{lang === 'ar' ? 'Français' : 'العربية'}</span>
                </button>

                {/* Login tab */}
                <button 
                  onClick={() => navigateTo('login')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] sm:text-sm px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full shadow-lg transition cursor-pointer"
                >
                  {t.login}
                </button>
              </div>

            </div>

            {/* Mobile & Tablet nav rail */}
            <div className="lg:hidden flex items-center justify-around border-t border-gray-100 py-2 bg-gray-50 text-[10px] sm:text-xs font-bold text-gray-500 tracking-tight px-2">
              <button onClick={() => navigateTo('home')} className={`flex flex-col items-center gap-0.5 ${currentTab === 'home' ? 'text-rose-500' : ''}`}>
                <Sparkles className="h-4 w-4" />
                <span>{t.home}</span>
              </button>
              <button onClick={() => navigateTo('catalog')} className={`flex flex-col items-center gap-0.5 ${currentTab === 'catalog' ? 'text-rose-500' : ''}`}>
                <SlidersHorizontal className="h-4 w-4" />
                <span>{t.catalog}</span>
              </button>
              <button onClick={() => navigateTo('sell')} className={`flex flex-col items-center gap-0.5 ${currentTab === 'sell' ? 'text-rose-500' : ''}`}>
                <ArrowRightLeft className="h-4 w-4" />
                <span>{t.sell}</span>
              </button>
              <button onClick={() => navigateTo('customers')} className={`flex flex-col items-center gap-0.5 ${currentTab === 'customers' ? 'text-rose-500' : ''}`}>
                <MessageSquare className="h-4 w-4" />
                <span>{lang === 'ar' ? 'آراء العملاء' : 'Avis'}</span>
              </button>
              <button onClick={() => navigateTo('contact')} className={`flex flex-col items-center gap-0.5 ${currentTab === 'contact' ? 'text-rose-500' : ''}`}>
                <Phone className="h-4 w-4" />
                <span>{t.contact}</span>
              </button>
            </div>
          </header>

          {/* Render individual screens */}

          {/* PAGE 1: HOMEPAGE */}
          {currentTab === 'home' && !selectedCarId && (
            <div className="space-y-16 pb-16">
              
              {/* Immersive Airbnb Hero Section */}
              <section id="hero-banner" className="relative bg-slate-900 min-h-[500px] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
                {/* Visual Background */}
                <div className="absolute inset-0">
                  <img 
                    src="https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1600&q=80" 
                    alt="Mercedes C Class" 
                    className="w-full h-full object-cover opacity-35" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center text-white space-y-6">
                  <span className="bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{lang === 'ar' ? 'الرائد في مراكش' : 'N°1 à Marrakech'}</span>
                  </span>

                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                    {lang === 'ar' ? showroomHeroTitleAr : showroomHeroTitleFr}
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
                    {lang === 'ar' ? showroomHeroSubtitleAr : showroomHeroSubtitleFr}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <button 
                      onClick={() => navigateTo('catalog')}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-rose-500/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base"
                    >
                      {t.viewCars}
                    </button>
                    <button 
                      onClick={() => navigateTo('sell')}
                      className="bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold py-3.5 px-8 rounded-full backdrop-blur-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base"
                    >
                      {t.sellYourCar}
                    </button>
                  </div>
                </div>
              </section>

              {/* Counters Stats Grid */}
              <section id="stats-counters" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 sm:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center shadow-sm">
                  <div>
                    <h3 className="text-4xl sm:text-5xl font-black text-rose-500 tracking-tight">35+</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-2">{t.statsCars}</p>
                  </div>
                  <div className="border-r border-gray-200/80 pr-4 sm:pr-8">
                    <h3 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">20+</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-2">{t.statsYears}</p>
                  </div>
                  <div className="border-r border-gray-200/80 pr-4 sm:pr-8">
                    <h3 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">1,200+</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-2">{t.statsCustomers}</p>
                  </div>
                  <div className="border-r border-gray-200/80 pr-4 sm:pr-8">
                    <h3 className="text-4xl sm:text-5xl font-black text-rose-500 tracking-tight">850+</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-2">{t.statsSold}</p>
                  </div>
                </div>
              </section>

              {/* Brand categories pills selection */}
              <section id="brand-categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {t.featuredBrands}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'ar' ? 'نوفر موديلات متميزة ومفحوصة لأرقى ماركات السيارات العالمية' : 'Nous sélectionnons avec soin les modèles de constructeurs de prestige.'}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 py-2">
                  {availableBrands.map((b) => (
                    <button 
                      key={b}
                      onClick={() => {
                        setSearchBrand(b);
                        navigateTo('catalog');
                      }}
                      className="bg-white border border-gray-200 hover:border-rose-500 hover:bg-rose-50 text-gray-700 font-semibold text-xs sm:text-sm rounded-full px-5 py-2.5 shadow-sm transition duration-200 cursor-pointer"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </section>

              {/* Trade-in Trade representation banner (Reprise) */}
              <section id="reprise-info" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-3xl p-8 sm:p-12 md:flex items-center justify-between gap-10">
                  <div className="space-y-4 max-w-2xl">
                    <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {lang === 'ar' ? 'وفر وقتك ومالك' : 'RAPIDE & FIABLE'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                      {t.repriseTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                      {t.repriseText}
                    </p>
                  </div>
                  <div className="shrink-0 mt-6 md:mt-0">
                    <button 
                      onClick={() => navigateTo('sell')}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-rose-100 transition cursor-pointer text-xs sm:text-sm"
                    >
                      {lang === 'ar' ? 'ابدأ في عملية الاستبدال' : 'Simuler une Reprise'}
                    </button>
                  </div>
                </div>
              </section>

              {/* VISITOR REVIEWS & FEEDBACK SECTION */}
              <VisitorReviewsSection 
                lang={lang}
                reviews={reviews}
                onAddReview={handleAddVisitorReview}
              />

              {/* Advanced Custom Notifications preference Form (Advanced idea) */}
              <section id="custom-alerts" className="max-w-3xl mx-auto px-4 py-6">
                <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 sm:p-8 text-center space-y-4">
                  <h3 className="font-extrabold text-gray-800 text-lg">
                    {lang === 'ar' ? 'إشعار عند نزول سيارة مطابقة (Smart Alert)' : 'Alerte Voiture Idéale'}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    {lang === 'ar' ? 'هل تبحث عن مواصفات محددة؟ اترك طلبك وسنرسل لك رسالة فور توفرها بمخزننا.' : 'Entrez vos critères, nous vous préviendrons par WhatsApp dès l\'arrivée en concession.'}
                  </p>
                  <form onSubmit={handleSubscribeAlert} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder={lang === 'ar' ? 'مثال: Mercedes' : 'Ex: Mercedes'} 
                      value={alertPrefBrand}
                      onChange={e => setAlertPrefBrand(e.target.value)}
                      className="bg-gray-50 border border-gray-200 outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 focus:border-rose-500"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder={lang === 'ar' ? 'رقم الهاتف' : 'N° Téléphone'} 
                      value={alertPrefPhone}
                      onChange={e => setAlertPrefPhone(e.target.value)}
                      className="bg-gray-50 border border-gray-200 outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 focus:border-rose-500"
                      required
                    />
                    <button 
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                    >
                      {lang === 'ar' ? 'تفعيل الإشعار الذكي' : 'Activer l\'alerte'}
                    </button>
                  </form>
                </div>
              </section>

            </div>
          )}

          {/* PAGE 2: CATALOG & FILTERS */}
          {currentTab === 'catalog' && !selectedCarId && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              
              {/* Header Title */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {t.catalog}
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'ar' ? `نعرض سيارات فاخرة منتقاة بعناية (${filteredCars.length} متوفرة حالياً)` : `Découvrez notre stock certifié (${filteredCars.length} véhicules disponibles)`}
                  </p>
                </div>

                {/* Reset filters */}
                <button 
                  onClick={() => {
                    setSearchBrand('');
                    setFilterType('all');
                    setFilterPrice(maxCatalogPrice);
                    setFilterFuel('all');
                    setFilterTransmission('all');
                  }}
                  className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  {t.resetFilters}
                </button>
              </div>

              {/* Airbnb-style Filter panel bar */}
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Brand Search input */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">{t.brand}</label>
                  <input 
                    type="text" 
                    value={searchBrand}
                    onChange={(e) => setSearchBrand(e.target.value)}
                    placeholder={lang === 'ar' ? 'ابحث بالماركة...' : 'Rechercher...'}
                    className="w-full bg-white border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2 px-3 text-xs sm:text-sm text-gray-800 transition"
                  />
                </div>

                {/* Body Type Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">{t.bodyType}</label>
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs sm:text-sm text-gray-800 transition"
                  >
                    <option value="all">{t.allCars}</option>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                  </select>
                </div>

                {/* Fuel Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">{t.fuel}</label>
                  <select 
                    value={filterFuel}
                    onChange={(e) => setFilterFuel(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs sm:text-sm text-gray-800 transition"
                  >
                    <option value="all">{t.allCars}</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Essence">Essence</option>
                    <option value="Hybride">Hybride</option>
                  </select>
                </div>

                {/* Transmission Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">{t.transmission}</label>
                  <select 
                    value={filterTransmission}
                    onChange={(e) => setFilterTransmission(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs sm:text-sm text-gray-800 transition"
                  >
                    <option value="all">{t.allCars}</option>
                    <option value="Automatique">Automatique</option>
                    <option value="Manuelle">Manuelle</option>
                  </select>
                </div>

                {/* Price Slider */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">{t.price}</label>
                    <span className="text-xs font-bold text-rose-500">
                      {filterPrice >= maxCatalogPrice 
                        ? `${maxCatalogPrice.toLocaleString()} DHS+ (${isRtl ? 'الكل' : 'Tous'})` 
                        : `${filterPrice.toLocaleString()} DHS`}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="50000" 
                    max={maxCatalogPrice} 
                    step="5000"
                    value={filterPrice}
                    onChange={(e) => setFilterPrice(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none mt-3"
                  />
                </div>

              </div>

              {/* Cars Grid */}
              {filteredCars.length === 0 ? (
                <div className="text-center py-24 bg-gray-50 border border-dashed rounded-3xl flex flex-col items-center justify-center space-y-3">
                  <HelpCircle className="h-10 w-10 text-rose-500 animate-pulse" />
                  <p className="font-bold text-gray-800 text-sm sm:text-base">{t.noCarsFound}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {filteredCars.map((car) => {
                    const isFav = favorites.includes(car.id);
                    return (
                      <div 
                        key={car.id} 
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 relative group cursor-pointer flex flex-col justify-between"
                        onClick={() => navigateTo('home', car.id)}
                      >
                        {/* Favorite Absolute button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(car.id);
                          }}
                          className="absolute top-3 right-3 z-10 p-2.5 bg-white/80 hover:bg-white rounded-full shadow-md transition cursor-pointer"
                        >
                          <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
                        </button>

                        <div>
                          {/* Main Photo */}
                          <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                            <img 
                              src={car.images[0]} 
                              alt={car.model} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                            <div className="absolute bottom-2.5 left-2.5 bg-slate-950/70 backdrop-blur-sm text-[10px] text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              {car.condition}
                            </div>
                          </div>

                          {/* Details Content */}
                          <div className="p-4 sm:p-5 space-y-3.5">
                            <div>
                              <div className="flex justify-between items-baseline">
                                <h3 className="font-extrabold text-gray-900 text-sm sm:text-base tracking-tight truncate max-w-[80%]">
                                  {car.brand} {car.model}
                                </h3>
                                <span className="text-xs text-rose-500 font-bold">★ 4.6</span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">{car.year} • {car.fuel} • {car.transmission}</p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100"></div>

                            {/* Specs overview */}
                            <div className="flex justify-between items-center text-[11px] text-gray-500 font-semibold">
                              <span>{car.km.toLocaleString()} km</span>
                              <span>{car.type}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price footer */}
                        <div className="p-4 sm:p-5 pt-0 flex justify-between items-center bg-gray-50 border-t border-gray-100">
                          <div>
                            <span className="text-base sm:text-lg font-black text-slate-800">{car.price.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-500 uppercase ml-1">DHS</span>
                          </div>
                          <span className="text-xs text-rose-500 font-bold hover:underline cursor-pointer">
                            {t.details}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* PAGE 3: CAR DETAILS SCREEN (Delegated to CarDetails.tsx) */}
          {selectedCarId && (
            (() => {
              const car = cars.find(c => c.id === selectedCarId);
              if (!car) return <div className="p-10 text-center">Car not found</div>;
              return (
                <CarDetails 
                  lang={lang}
                  car={car}
                  onBack={() => navigateTo('catalog')}
                  onApplyFinance={() => {}}
                  onBookAppointment={(c) => {
                    setAppCarId(c.id);
                    navigateTo('contact');
                  }}
                  onTradeIn={(c) => handleStartReprise(c)}
                  isFavorite={favorites.includes(car.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })()
          )}

          {/* PAGE 4: SELL YOUR CAR FORM */}
          {currentTab === 'sell' && (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="text-center space-y-2">
                <span className="bg-rose-50 text-rose-600 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border border-rose-100">
                  {isRtl ? 'خدمات الاستبدال والبيع - عدنان أوتو' : 'Service Reprise & Vente Cash'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {isRtl ? 'الاستبدال والبيع المباشر للسيارات' : 'Reprise & Vente Directe'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
                  {isRtl ? 'اختر نوع الخدمة: استبدل سيارتك القديمة بأخرى من معرضنا أو بعها مباشرة بأعلى سعر' : 'Choisissez le service souhaité : Échangez votre voiture contre un modèle du showroom ou vendez-la cash.'}
                </p>
              </div>

              {/* SERVICE TYPE CHOICE TOGGLE SWITCHER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setSellRequestType('Reprise')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative ${
                    sellRequestType === 'Reprise'
                      ? 'border-rose-500 bg-rose-50/40 shadow-md ring-2 ring-rose-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl ${sellRequestType === 'Reprise' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <ArrowRightLeft className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900">
                        {isRtl ? '🔄 استبدال سيارة (Reprise)' : '🔄 Service Reprise (Trade-in)'}
                      </h3>
                      <span className="text-[10px] text-rose-600 font-bold">
                        {isRtl ? 'الخيار الأكثر إقبالاً' : 'Le plus demandé'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {isRtl 
                      ? 'اختر سيارة متوفرة في المعرض، وسنقوم بتقييم سيارتك القديمة لخصم قيمتها وادفع/استلم الفارق بسهولة.'
                      : 'Échangez votre véhicule contre une voiture du showroom et réglez la différence.'}
                  </p>
                </div>

                <div 
                  onClick={() => setSellRequestType('Sale')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative ${
                    sellRequestType === 'Sale'
                      ? 'border-rose-500 bg-rose-50/40 shadow-md ring-2 ring-rose-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl ${sellRequestType === 'Sale' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900">
                        {isRtl ? '🏷️ بيع مباشر (Vente Cash)' : '🏷️ Vente Directe Cash'}
                      </h3>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {isRtl ? 'دفع فوري نقداً' : 'Paiement cash'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {isRtl 
                      ? 'بع سيارتك مباشرة لمعرضنا دون الانتظار، واستلم ثمنها كاملاً بعد المعاينة والتقييم.'
                      : 'Vendez votre voiture directement à notre concession au meilleur prix du marché.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSellSubmit} className="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
                {/* IF REPRISE IS SELECTED: SELECT TARGET SHOWROOM CAR */}
                {sellRequestType === 'Reprise' && (
                  <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-lg border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-rose-400" />
                      <h3 className="font-extrabold text-sm text-white">
                        {isRtl ? 'السيارة المرغوب الشراء/الاستبدال بها من معرضنا' : 'Sélectionnez la voiture désirée du showroom'}
                      </h3>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                        {isRtl ? 'اختر السيارة المستهدفة من المعرض:' : 'Voiture du showroom :'}
                      </label>
                      <select 
                        value={sellTargetCarId}
                        onChange={e => setSellTargetCarId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-white font-semibold"
                      >
                        <option value="">
                          {isRtl ? '★ أي سيارة متوفرة بالمعرض (سيحددها المستشار معكم)' : '★ N\'importe quel véhicule du showroom'}
                        </option>
                        {cars.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.brand} {c.model} ({c.year}) - {c.price.toLocaleString()} DHS
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preview selected target car if selected */}
                    {sellTargetCarId && (() => {
                      const targetCar = cars.find(c => c.id === sellTargetCarId);
                      if (!targetCar) return null;
                      const estimatedDiff = targetCar.price - (sellPrice || 0);
                      return (
                        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 flex items-center gap-4">
                          <img src={targetCar.images[0]} alt={targetCar.model} className="w-16 h-12 object-cover rounded-lg shrink-0 border border-slate-600" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-xs text-white truncate">{targetCar.brand} {targetCar.model} ({targetCar.year})</h4>
                            <p className="text-[11px] text-rose-400 font-black">{targetCar.price.toLocaleString()} DHS</p>
                          </div>
                          <div className="text-left bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0">
                            <span className="text-[9px] uppercase font-bold text-gray-400 block">{isRtl ? 'الفارق التقديري' : 'Différence'}</span>
                            <span className={`text-xs font-extrabold ${estimatedDiff >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {estimatedDiff >= 0 ? `+${estimatedDiff.toLocaleString()} DHS` : `${estimatedDiff.toLocaleString()} DHS`}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.carBrand}</label>
                    <select 
                      value={sellBrand}
                      onChange={e => setSellBrand(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                    >
                      {['Mercedes', 'Volkswagen', 'Hyundai', 'Peugeot', 'Renault', 'Nissan', 'Kia', 'Toyota', 'Dacia', 'Seat'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.carModel}</label>
                    <input 
                      type="text" 
                      value={sellModel}
                      onChange={e => setSellModel(e.target.value)}
                      placeholder="Ex: Tiguan 2.0 TDI"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.carYear}</label>
                    <input 
                      type="number" 
                      value={sellYear}
                      onChange={e => setSellYear(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.carKm}</label>
                    <input 
                      type="number" 
                      value={sellKm}
                      onChange={e => setSellKm(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.requestedPrice}</label>
                    <input 
                      type="number" 
                      value={sellPrice}
                      onChange={e => setSellPrice(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.carCondition}</label>
                    <select 
                      value={sellCondition}
                      onChange={e => setSellCondition(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Très bon">Très bon</option>
                      <option value="Bon">Bon</option>
                    </select>
                  </div>

                  {/* Phone field with OTP Ownership Verification Button */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-gray-600">{t.clientPhone}</label>
                      {sellPhoneVerified && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                          {isRtl ? 'تم التحقق ✓' : 'Vérifié ✓'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="tel" 
                        value={sellPhone}
                        onChange={e => {
                          setSellPhone(e.target.value);
                          setSellPhoneVerified(false);
                        }}
                        placeholder="+212 6..."
                        className="flex-1 bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800 font-mono"
                        required
                      />
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (!sellPhone || sellPhone.trim().length < 6) {
                            alert(isRtl ? 'يرجى كتابة رقم الهاتف أولاً للتحقق من ملكيته' : 'Veuillez d\'abord saisir votre numéro de téléphone.');
                            return;
                          }
                          setIsPhoneModalOpen(true);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 ${
                          sellPhoneVerified 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>{sellPhoneVerified ? (isRtl ? 'موثق' : 'Vérifié') : (isRtl ? 'تحقق من الملكية' : 'Vérifier')}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {isRtl ? 'سنرسل كود SMS قصير لربط الطلب برقمك المباشر.' : 'Un code SMS permettra de vérifier la propriété du numéro.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.clientCity}</label>
                    <input 
                      type="text" 
                      value={sellCity}
                      onChange={e => setSellCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                      required
                    />
                  </div>
                </div>

                {/* Real Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.uploadImages}</label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files) {
                        const filesArray = Array.from(e.dataTransfer.files) as File[];
                        processFiles(filesArray);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition duration-200 ${
                      isDragging 
                        ? 'border-rose-500 bg-rose-50/30' 
                        : 'border-gray-200/80 hover:bg-gray-50/50'
                    }`}
                  >
                    <span className="text-xs text-gray-500 font-medium block">
                      {t.dragDropText}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {lang === 'ar' ? '(الحد الأقصى لعدد الصور: 10)' : '(Max: 10 images)'}
                    </span>
                  </div>

                  {sellImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                      {sellImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 group shadow-sm bg-gray-50">
                          <img 
                            src={img} 
                            alt={`Upload Preview ${idx + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSellImages(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-full transition duration-150"
                            title={lang === 'ar' ? 'حذف' : 'Supprimer'}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Real Video Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {lang === 'ar' ? 'فيديو للسيارة (اختياري)' : 'Vidéo du véhicule (Optionnel)'}
                  </label>
                  <input 
                    type="file" 
                    ref={videoFileInputRef} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setSellVideo(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    accept="video/*" 
                    className="hidden" 
                  />
                  <div 
                    onClick={() => videoFileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsVideoDragging(true); }}
                    onDragLeave={() => setIsVideoDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsVideoDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setSellVideo(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition duration-200 ${
                      isVideoDragging 
                        ? 'border-rose-500 bg-rose-50/30' 
                        : 'border-gray-200/80 hover:bg-gray-50/50'
                    }`}
                  >
                    <span className="text-xs text-gray-500 font-medium block">
                      {lang === 'ar' 
                        ? 'اسحب فيديو للسيارة هنا أو انقر لتصفح الملفات' 
                        : 'Glissez une vidéo ici ou cliquez pour parcourir les fichiers'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {lang === 'ar' ? '(الحد الأقصى: فيديو واحد، صيغ MP4, WebM)' : '(Max: 1 vidéo, formats MP4, WebM)'}
                    </span>
                  </div>

                  {sellVideo && (
                    <div className="mt-3">
                      <div className="relative max-w-xs aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group">
                        <video 
                          src={sellVideo} 
                          className="w-full h-full object-cover" 
                          controls
                        />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSellVideo('');
                          }}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-full transition duration-150 z-10"
                          title={lang === 'ar' ? 'حذف' : 'Supprimer'}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-rose-100 transition cursor-pointer text-sm"
                >
                  {t.submitSell}
                </button>
              </form>
            </div>
          )}

          {/* PAGE 5: CUSTOMERS & VISITOR REVIEWS */}
          {currentTab === 'customers' && (
            <div className="py-6">
              <VisitorReviewsSection 
                lang={lang}
                reviews={reviews}
                onAddReview={handleAddVisitorReview}
              />
            </div>
          )}

          {/* PAGE 6: ABOUT US */}
          {currentTab === 'about' && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{t.aboutTitle}</h1>
                <p className="text-xs text-gray-400">Massira 2, Marrakech • {t.slogan}</p>
              </div>

              {/* Showroom visual */}
              <div className="rounded-3xl overflow-hidden aspect-[21/9] bg-gray-100 shadow-lg border border-gray-100 relative">
                <img 
                  src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80" 
                  alt="Showroom" 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
                <p>{t.aboutText1}</p>
                <p>{t.aboutText2}</p>
              </div>

              {/* Company Values */}
              <div className="border-t border-gray-100 pt-8 space-y-6">
                <h3 className="font-extrabold text-gray-800 text-lg text-center">{t.values}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                    <span className="text-2xl">🤝</span>
                    <h4 className="font-extrabold text-gray-800 text-sm mt-3">{t.honesty}</h4>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                    <span className="text-2xl">🚗</span>
                    <h4 className="font-extrabold text-gray-800 text-sm mt-3">{t.quality}</h4>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                    <span className="text-2xl">❤️</span>
                    <h4 className="font-extrabold text-gray-800 text-sm mt-3">{t.customerFirst}</h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 7: CONTACT US & APPOINTMENT */}
          {currentTab === 'contact' && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{t.contactTitle}</h1>
                <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">{t.bookSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left: Interactive Appointment booking Form */}
                <div className="lg:col-span-7 bg-white border border-gray-100 shadow-xl rounded-3xl p-6 sm:p-8 space-y-4">
                  <h3 className="font-extrabold text-gray-800 text-lg mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-rose-500" />
                    <span>{t.bookTitle}</span>
                  </h3>

                  <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.selectDate}</label>
                        <input 
                          type="date" 
                          value={appDate}
                          onChange={e => setAppDate(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.selectTime}</label>
                        <select 
                          value={appTime}
                          onChange={e => setAppTime(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                        >
                          <option value="09:00">09:00</option>
                          <option value="10:00">10:00</option>
                          <option value="11:00">11:00</option>
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                          <option value="17:00">17:00</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.clientName}</label>
                        <input 
                          type="text" 
                          placeholder="Badr Daoudi"
                          value={appName}
                          onChange={e => setAppName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.clientPhone}</label>
                        <input 
                          type="tel" 
                          placeholder="+212 6..."
                          value={appPhone}
                          onChange={e => setAppPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{lang === 'ar' ? 'السيارة المراد معاينتها' : 'Véhicule d\'intérêt'}</label>
                      <select 
                        value={appCarId}
                        onChange={e => setAppCarId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800"
                      >
                        <option value="">{lang === 'ar' ? 'معاينة عامة للمعرض' : 'Visite générale showroom'}</option>
                        {cars.map(c => (
                          <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-100 transition duration-200 cursor-pointer text-sm"
                    >
                      {t.submitBook}
                    </button>
                  </form>
                </div>

                {/* Right: Contact info cards and Marrakech Map placeholder */}
                <div className="lg:col-span-5 space-y-6 text-sm text-gray-600">
                  <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-800 text-xs sm:text-sm">{t.addressLabel}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {lang === 'ar' ? showroomAddressAr : showroomAddressFr}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 border-t border-gray-200/60 pt-3">
                      <Phone className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-800 text-xs sm:text-sm">
                          {lang === 'ar' ? 'رقم الهاتف المباشر' : 'Téléphone Showroom'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-bold font-mono">{showroomPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border-t border-gray-200/60 pt-3">
                      <Clock className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-gray-800 text-xs sm:text-sm">{t.workHours}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {lang === 'ar' ? showroomWorkHoursAr : showroomWorkHoursFr}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Google Map Representation */}
                  <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-slate-950 border border-gray-100 shadow-sm relative w-full h-[280px]">
                    {(() => {
                      const url = showroomMapUrl || '';
                      if (url.includes('<iframe')) {
                        const srcMatch = url.match(/src="([^"]+)"/);
                        if (srcMatch && srcMatch[1]) {
                          return (
                            <iframe
                              src={srcMatch[1]}
                              className="w-full h-full border-0"
                              allowFullScreen={true}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          );
                        }
                      }
                      if (url.startsWith('http')) {
                        if (url.includes('/embed') || url.includes('output=embed')) {
                          return (
                            <iframe
                              src={url}
                              className="w-full h-full border-0"
                              allowFullScreen={true}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          );
                        }
                        // Render standard iframe by embedding the URL
                        return (
                          <iframe
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(showroomMapTitle || 'Marrakech')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                            className="w-full h-full border-0"
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        );
                      }
                      // Fallback with search embed using title
                      return (
                        <iframe
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(showroomMapTitle || 'Marrakech')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          className="w-full h-full border-0"
                          allowFullScreen={true}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating AI Consultant Widget & Footer */}
          <AIAdvisor lang={lang} />

          {/* Elegant Footer (Airbnb Inspired) */}
          <footer className="bg-gray-50 border-t border-gray-100 py-10 mt-auto text-xs text-gray-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <BrandLogo variant="light" height="42px" className="!justify-start" />
                <p className="text-gray-400 leading-relaxed font-medium mt-2">
                  {lang === 'ar' ? showroomSloganAr : showroomSloganFr}
                </p>
                <p className="font-bold text-rose-500">
                  {lang === 'ar' ? showroomAddressAr.split('،')[0] : showroomAddressFr.split(',')[0]}
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-sm font-bold text-gray-800">{lang === 'ar' ? 'روابط سريعة' : 'Liens utiles'}</span>
                <ul className="space-y-1.5 font-medium">
                  <li><button onClick={() => navigateTo('home')} className="hover:underline">{t.home}</button></li>
                  <li><button onClick={() => navigateTo('catalog')} className="hover:underline">{t.catalog}</button></li>
                  <li><button onClick={() => navigateTo('sell')} className="hover:underline">{t.sell}</button></li>
                </ul>
              </div>
              <div className="space-y-3">
                <span className="text-sm font-bold text-gray-800">{lang === 'ar' ? 'المواعيد' : 'Rendez-vous'}</span>
                <ul className="space-y-1.5 font-medium">
                  <li><button onClick={() => navigateTo('contact')} className="hover:underline">{t.appointment}</button></li>
                </ul>
              </div>
              <div className="space-y-3">
                <span className="text-sm font-bold text-gray-800">Contact</span>
                <p className="font-medium">{showroomEmail}</p>
                <p className="font-bold text-rose-500">{showroomPhone}</p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-200/60 pt-6 mt-8 flex flex-wrap justify-between items-center gap-4 text-gray-400 font-medium">
              <p>{t.footerText}</p>
              <div className="flex gap-4">
                {showroomFacebook && (
                  <a href={showroomFacebook} target="_blank" rel="noreferrer" className="hover:underline text-rose-500">
                    Facebook
                  </a>
                )}
                {showroomInstagram && (
                  <a href={showroomInstagram} target="_blank" rel="noreferrer" className="hover:underline text-rose-500">
                    Instagram
                  </a>
                )}
                {showroomWhatsApp && (
                  <a href={`https://wa.me/${showroomWhatsApp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline text-rose-500">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </footer>

          {/* Compare Modal */}
          {isCompareOpen && (
            <CompareModal 
              lang={lang}
              cars={cars}
              onClose={() => setIsCompareOpen(false)}
            />
          )}

        </>
      ) : currentTab === 'login' ? (
        // Render TrelloLogin component
        <TrelloLogin 
          lang={lang}
          onLoginSuccess={handleLoginSuccess}
          onBack={() => navigateTo('home')}
        />
      ) : (
        // Render Falcon style CMS Dashboard
        <CMSDashboard 
          lang={lang}
          cars={cars}
          onUpdateCars={handleUpdateCars}
          sellRequests={sellRequests}
          onUpdateSellRequests={handleUpdateSellRequests}
          financeRequests={financeRequests}
          onUpdateFinanceRequests={handleUpdateFinanceRequests}
          alerts={alerts}
          onUpdateAlerts={handleUpdateAlerts}
          appointments={appointments}
          onUpdateAppointments={handleUpdateAppointments}
          reviews={reviews}
          onUpdateReviews={handleUpdateReviews}
          showroomInfo={{
            addressAr: showroomAddressAr,
            addressFr: showroomAddressFr,
            phone: showroomPhone,
            workHoursAr: showroomWorkHoursAr,
            workHoursFr: showroomWorkHoursFr,
            mapTitle: showroomMapTitle,
            mapDesc: showroomMapDesc,
            mapUrl: showroomMapUrl,
            email: showroomEmail,
            whatsapp: showroomWhatsApp,
            facebook: showroomFacebook,
            instagram: showroomInstagram,
            brandNameAr: showroomBrandNameAr,
            brandNameFr: showroomBrandNameFr,
            heroTitleAr: showroomHeroTitleAr,
            heroTitleFr: showroomHeroTitleFr,
            heroSubtitleAr: showroomHeroSubtitleAr,
            heroSubtitleFr: showroomHeroSubtitleFr,
            sloganAr: showroomSloganAr,
            sloganFr: showroomSloganFr,
            customLogoUrl: showroomLogoUrl,
          }}
          onUpdateShowroomInfo={handleUpdateShowroomInfo}
          onLogout={() => {
            localStorage.removeItem('adnane_admin_token');
            navigateTo('home');
          }}
        />
      )}

      {/* Phone Ownership Verification Modal */}
      <PhoneVerifyModal 
        lang={lang}
        phone={sellPhone}
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onVerified={() => {
          setSellPhoneVerified(true);
          if (pendingFormSubmit) {
            pendingFormSubmit();
            setPendingFormSubmit(null);
          }
        }}
      />

    </div>
  );
}
