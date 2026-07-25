/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ArrowLeft, Phone, Calendar, Heart, ShieldAlert, BadgeCheck, Share2, Compass, 
  Settings, Users, Fuel, Activity, Copy, CheckCircle, ArrowRightLeft
} from 'lucide-react';
import { Car } from '../data/mockCars';

interface CarDetailsProps {
  lang: 'ar' | 'fr';
  car: Car;
  onBack: () => void;
  onApplyFinance: (car: Car) => void;
  onBookAppointment: (car: Car) => void;
  onTradeIn: (car: Car) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function CarDetails({
  lang,
  car,
  onBack,
  onApplyFinance,
  onBookAppointment,
  onTradeIn,
  isFavorite,
  onToggleFavorite
}: CarDetailsProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedPrice = car.price.toLocaleString();
  const formattedKm = car.km.toLocaleString();

  const isRtl = lang === 'ar';

  // Customize WhatsApp text
  const waTextAr = `السلام عليكم عدنان أوتو، أنا مهتم بسيارة ${car.brand} ${car.model} موديل ${car.year} المعروضة بموقعكم بسعر ${formattedPrice} درهم. هل هي متوفرة حالياً؟`;
  const waTextFr = `Bonjour Adnane Auto, je suis intéressé par la voiture d'occasion ${car.brand} ${car.model} ${car.year} affichée à ${formattedPrice} DHS. Est-elle toujours disponible ?`;
  const waUrl = `https://wa.me/212672601678?text=${encodeURIComponent(isRtl ? waTextAr : waTextFr)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition cursor-pointer mb-6"
      >
        <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
        <span className="font-semibold">{lang === 'ar' ? 'الرجوع للكتالوج' : 'Retour au catalogue'}</span>
      </button>

      {/* Header section (Airbnb style) */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {car.brand} <span className="text-rose-500 font-light">{car.model}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-rose-500 font-bold">★ 4.6</span>
            <span>(312 {lang === 'ar' ? 'تقييم' : 'avis'})</span>
          </span>
          <span>•</span>
          <span className="underline cursor-pointer hover:text-gray-800">Massira 2, Marrakech</span>
          <span>•</span>
          <span className="bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
            {car.condition}
          </span>
        </div>
      </div>

      {/* Media Grid (Airbnb style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Large Main Image or Video */}
        <div className="md:col-span-8 rounded-2xl overflow-hidden aspect-video bg-gray-100 relative group border border-gray-100 shadow-sm">
          {showVideo ? (
            <video 
              src={car.video || 'https://assets.mixkit.co/videos/preview/mixkit-car-underpass-at-night-42232-large.mp4'} 
              controls 
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={car.images[activeImageIdx]} 
              alt={car.model} 
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
            />
          )}
          {/* Heart indicator */}
          <button 
            onClick={() => onToggleFavorite(car.id)}
            className="absolute top-4 right-4 p-3 bg-white hover:bg-gray-50 rounded-full shadow-lg transition duration-200 cursor-pointer z-10"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Small thumbnail sidebar */}
        <div className="md:col-span-4 flex flex-row md:flex-col gap-3 h-full justify-between">
          {car.images.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setActiveImageIdx(idx);
                setShowVideo(false);
              }}
              className={`flex-1 rounded-xl overflow-hidden aspect-video bg-gray-100 relative border-2 ${
                (!showVideo && activeImageIdx === idx) ? 'border-rose-500' : 'border-transparent'
              } transition-all cursor-pointer`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          {/* Interactive Video Tour */}
          <button 
            onClick={() => setShowVideo(true)}
            className={`flex-1 rounded-xl bg-slate-900 relative flex items-center justify-center overflow-hidden aspect-video border-2 ${
              showVideo ? 'border-rose-500' : 'border-transparent'
            } shadow-sm transition-all cursor-pointer group`}
          >
            <img src={car.images[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="relative z-10 flex flex-col items-center gap-1">
              <span className="p-2.5 bg-rose-500 text-white rounded-full shadow-lg group-hover:bg-rose-600 transition">
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                {lang === 'ar' ? 'فيديو جولة' : 'Visite Vidéo'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Content Layout (Airbnb style with sidebar details panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Side: Specifications and Description */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Specifications Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
              <Activity className="h-5 w-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{lang === 'ar' ? 'المسافة' : 'Kilométrage'}</p>
                <p className="text-sm font-bold text-gray-800">{formattedKm} km</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
              <Fuel className="h-5 w-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{lang === 'ar' ? 'الوقود' : 'Carburant'}</p>
                <p className="text-sm font-bold text-gray-800">{car.fuel}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
              <Settings className="h-5 w-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{lang === 'ar' ? 'الناقل' : 'Transmission'}</p>
                <p className="text-sm font-bold text-gray-800">{car.transmission}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
              <Compass className="h-5 w-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{lang === 'ar' ? 'السنة' : 'Année'}</p>
                <p className="text-sm font-bold text-gray-800">{car.year}</p>
              </div>
            </div>
          </div>

          {/* About/Description Section */}
          <div className="border-t border-b border-gray-100 py-6">
            <h3 className="font-extrabold text-gray-800 text-lg mb-3">
              {lang === 'ar' ? 'وصف تفصيلي للسيارة' : 'Description du véhicule'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {lang === 'ar' ? car.descriptionAr : car.descriptionFr}
            </p>
          </div>

          {/* Technical Specifications Checklist */}
          <div>
            <h3 className="font-extrabold text-gray-800 text-lg mb-4">
              {lang === 'ar' ? 'المواصفات الفنية والتقنية' : 'Fiche technique détaillée'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex justify-between py-2 border-b border-gray-200/60 text-sm">
                <span className="text-gray-500">{lang === 'ar' ? 'محرك السيارة' : 'Motorisation'}</span>
                <span className="font-bold text-gray-800">{car.specs.engine}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200/60 text-sm">
                <span className="text-gray-500">{lang === 'ar' ? 'القوة الحصانية' : 'Puissance'}</span>
                <span className="font-bold text-gray-800">{car.specs.horsepower}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200/60 text-sm">
                <span className="text-gray-500">{lang === 'ar' ? 'القوة الجبائية' : 'Puissance fiscale'}</span>
                <span className="font-bold text-gray-800">{car.specs.fiscalPower}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200/60 text-sm">
                <span className="text-gray-500">{lang === 'ar' ? 'عدد الأبواب' : 'Portes'}</span>
                <span className="font-bold text-gray-800">{car.specs.doors}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200/60 text-sm">
                <span className="text-gray-500">{lang === 'ar' ? 'عدد المقاعد' : 'Places'}</span>
                <span className="font-bold text-gray-800">{car.specs.seats}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200/60 text-sm">
                <span className="text-gray-500">{lang === 'ar' ? 'اللون الخارجي' : 'Couleur extérieure'}</span>
                <span className="font-bold text-gray-800">{car.color}</span>
              </div>
            </div>
          </div>

          {/* Features and options list */}
          <div>
            <h3 className="font-extrabold text-gray-800 text-lg mb-4">
              {lang === 'ar' ? 'المميزات والخيارات المضافة' : 'Équipements & Options'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {car.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-white border border-gray-100 p-3.5 rounded-xl shadow-sm">
                  <BadgeCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Inspection Report */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="font-bold text-emerald-800 text-sm sm:text-base">
                {lang === 'ar' ? 'تقرير الفحص التقني لعدنان أوتو' : 'Certificat d\'inspection Adnane Auto'}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed mt-1">
                {lang === 'ar' 
                  ? 'تم فحص هذه السيارة بالكامل في معرضنا بمراكش وتشمل فحص الهيكل والمحرك وناقل الحركة. السيارة خالية تماماً من الحوادث وسليمة 100%.'
                  : 'Ce véhicule a été inspecté minutieusement par nos experts à Marrakech. Le châssis, le moteur et l\'électronique sont certifiés sans aucun défaut. Prêt pour livraison.'}
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Airbnb Action Booking Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xl sticky top-24 space-y-6">
            
            {/* Price display and CTA title */}
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{formattedPrice}</span>
                <span className="text-sm text-gray-500 ml-1">DHS</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                {lang === 'ar' ? 'جاهز للتسليم' : 'Disponible'}
              </span>
            </div>

            {/* Main call to actions */}
            <div className="space-y-3">
              <a 
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-emerald-100 cursor-pointer"
              >
                <svg className="h-5 w-5 fill-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.13 1.05 11.516 1.05 6.08 1.05 1.654 5.42 1.65 10.849c-.001 1.716.463 3.39 1.341 4.876l-.882 3.226 3.538-.917z"/>
                </svg>
                <span>{lang === 'ar' ? 'تواصل عبر واتساب' : 'Contact WhatsApp'}</span>
              </a>

              <a 
                href="tel:+212672601678"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg cursor-pointer"
              >
                <Phone className="h-4 w-4" />
                <span>+212 672 60 16 78</span>
              </a>
            </div>

            {/* Trade-In and Appointment Buttons */}
            <div className="grid grid-cols-1 gap-2.5 pt-3 border-t border-gray-100">
              <button 
                onClick={() => onTradeIn(car)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowRightLeft className="h-4 w-4 text-rose-400" />
                <span>{lang === 'ar' ? 'استبدال سيارتك بهذا الموديل (Reprise)' : 'Échanger avec ce modèle (Reprise)'}</span>
              </button>

              <button 
                onClick={() => onBookAppointment(car)}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-rose-100 transition duration-200 cursor-pointer"
              >
                {lang === 'ar' ? 'حجز موعد للمعاينة والقيادة' : 'Prendre rendez-vous'}
              </button>
            </div>

            {/* Quick Share / Info Links */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
              <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-rose-500 transition cursor-pointer"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                <span>{copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copié !') : (lang === 'ar' ? 'مشاركة' : 'Partager')}</span>
              </button>
              <div className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
                Ref: #{car.id}
              </div>
            </div>

            {/* QR Code Graphic (Airbnb style details) */}
            <div className="bg-gray-50 border rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lang === 'ar' ? 'اعرض الإعلان على هاتفك' : 'Scannez pour mobile'}</span>
              <div className="h-28 w-28 bg-white border p-2 rounded-xl flex items-center justify-center">
                {/* SVG mock QR Code */}
                <svg className="h-full w-full text-slate-800" viewBox="0 0 100 100">
                  <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                  <rect x="5" y="5" width="15" height="15" fill="white" />
                  <rect x="8" y="8" width="9" height="9" fill="currentColor" />
                  
                  <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                  <rect x="80" y="5" width="15" height="15" fill="white" />
                  <rect x="83" y="8" width="9" height="9" fill="currentColor" />

                  <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                  <rect x="5" y="80" width="15" height="15" fill="white" />
                  <rect x="8" y="83" width="9" height="9" fill="currentColor" />

                  <rect x="35" y="35" width="30" height="30" fill="currentColor" />
                  <rect x="40" y="40" width="20" height="20" fill="white" />
                  <rect x="45" y="45" width="10" height="10" fill="currentColor" />

                  {/* Random QR blocks */}
                  <rect x="30" y="5" width="10" height="10" fill="currentColor" />
                  <rect x="55" y="10" width="15" height="15" fill="currentColor" />
                  <rect x="10" y="35" width="15" height="15" fill="currentColor" />
                  <rect x="75" y="45" width="15" height="15" fill="currentColor" />
                  <rect x="35" y="75" width="15" height="15" fill="currentColor" />
                  <rect x="65" y="70" width="20" height="20" fill="currentColor" />
                </svg>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
