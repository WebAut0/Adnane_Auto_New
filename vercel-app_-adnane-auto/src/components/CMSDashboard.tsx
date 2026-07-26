/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  BarChart3, Car as CarIcon, DollarSign, Calendar, Star, Users, Plus, Edit3, Trash2, Eye,
  Check, X, FileText, LayoutDashboard, LogOut, Shield, Search, CloudSun, Bell, Menu, Upload, Video, MapPin, Clock, Phone, Mail, MessageSquare,
  ShieldAlert, Ban, Activity, RefreshCw, Pin, MessageCircleReply, ThumbsUp, CheckCircle2, Sparkles, CornerDownLeft, Send
} from 'lucide-react';
import { Car, SellRequest, FinanceRequest, Appointment, Review, AlertRequest } from '../data/mockCars';
import { BrandLogo } from './BrandLogo';

interface CMSDashboardProps {
  lang: 'ar' | 'fr';
  cars: Car[];
  onUpdateCars: (cars: Car[]) => void;
  sellRequests: SellRequest[];
  onUpdateSellRequests: (reqs: SellRequest[]) => void;
  financeRequests: FinanceRequest[];
  onUpdateFinanceRequests: (reqs: FinanceRequest[]) => void;
  alerts: AlertRequest[];
  onUpdateAlerts: (alerts: AlertRequest[]) => void;
  appointments: Appointment[];
  onUpdateAppointments: (apps: Appointment[]) => void;
  reviews: Review[];
  onUpdateReviews: (revs: Review[]) => void;
  showroomInfo: {
    addressAr: string;
    addressFr: string;
    phone: string;
    workHoursAr: string;
    workHoursFr: string;
    mapTitle: string;
    mapDesc: string;
    mapUrl: string;
    email: string;
    whatsapp: string;
    facebook: string;
    instagram: string;
    brandNameAr: string;
    brandNameFr: string;
    heroTitleAr: string;
    heroTitleFr: string;
    heroSubtitleAr: string;
    heroSubtitleFr: string;
    sloganAr: string;
    sloganFr: string;
    customLogoUrl?: string;
  };
  onUpdateShowroomInfo: (updates: {
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
  }) => void;
  onLogout: () => void;
}

export default function CMSDashboard({
  lang,
  cars,
  onUpdateCars,
  sellRequests,
  onUpdateSellRequests,
  financeRequests,
  onUpdateFinanceRequests,
  alerts,
  onUpdateAlerts,
  appointments,
  onUpdateAppointments,
  reviews,
  onUpdateReviews,
  showroomInfo,
  onUpdateShowroomInfo,
  onLogout
}: CMSDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'sell' | 'appointments' | 'leads' | 'reviews' | 'showroom' | 'security' | 'intrusion_security'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [leadsSubTab, setLeadsSubTab] = useState<'finance' | 'alerts'>('finance');

  // Review Management States
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyTextAr, setReplyTextAr] = useState('');
  const [replyTextFr, setReplyTextFr] = useState('');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'all'>('all');

  // Intrusion & Security Monitoring States
  const [intrusionLogs, setIntrusionLogs] = useState<any[]>([]);
  const [bannedIPs, setBannedIPs] = useState<string[]>([]);
  const [securityTabMessage, setSecurityTabMessage] = useState('');
  const [securityTabIsError, setSecurityTabIsError] = useState(false);
  const [securityTabLoading, setSecurityTabLoading] = useState(false);
  const [manualBanIP, setManualBanIP] = useState('');

  // Fetch security info from backend
  const fetchSecurityData = async () => {
    setSecurityTabLoading(true);
    try {
      const token = localStorage.getItem('adnane_admin_token');
      const [logsRes, bannedRes] = await Promise.all([
        fetch(`/api/admin/security/logs?token=${token}`),
        fetch(`/api/admin/security/banned?token=${token}`)
      ]);

      if (logsRes.ok && bannedRes.ok) {
        const logsData = await logsRes.json();
        const bannedData = await bannedRes.json();
        setIntrusionLogs(logsData.logs || []);
        setBannedIPs(bannedData.banned || []);
      }
    } catch (err) {
      console.error('Failed to fetch security logs:', err);
    } finally {
      setSecurityTabLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'intrusion_security') {
      fetchSecurityData();
    }
  }, [activeTab]);

  const handleUnbanIP = async (ip: string) => {
    if (!window.confirm(lang === 'ar' ? `هل أنت متأكد من إلغاء حظر الـ IP: ${ip}؟` : `Êtes-vous sûr de vouloir débannir l'IP : ${ip} ?`)) return;
    try {
      const token = localStorage.getItem('adnane_admin_token');
      const response = await fetch('/api/admin/security/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ipToUnban: ip })
      });
      if (response.ok) {
        setBannedIPs(prev => prev.filter(item => item !== ip));
        setSecurityTabIsError(false);
        setSecurityTabMessage(lang === 'ar' ? `تم إلغاء حظر الـ IP بنجاح` : `IP débannie avec succès`);
        fetchSecurityData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualBanIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBanIP.trim()) return;
    try {
      const token = localStorage.getItem('adnane_admin_token');
      const response = await fetch('/api/admin/security/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ipToBan: manualBanIP })
      });
      if (response.ok) {
        setManualBanIP('');
        setSecurityTabIsError(false);
        setSecurityTabMessage(lang === 'ar' ? 'تم حظر عنوان الـ IP بنجاح وللأبد!' : 'IP bannie avec succès pour toujours !');
        fetchSecurityData();
      } else {
        const data = await response.json().catch(() => ({}));
        setSecurityTabIsError(true);
        setSecurityTabMessage(data.error || 'Failed to ban IP');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearIntrusionLogs = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من مسح جميع سجلات الاختراق؟' : 'Êtes-vous sûr de vouloir vider l\'historique des intrusions ?')) return;
    try {
      const token = localStorage.getItem('adnane_admin_token');
      const response = await fetch('/api/admin/security/clear-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      if (response.ok) {
        setIntrusionLogs([]);
        setSecurityTabIsError(false);
        setSecurityTabMessage(lang === 'ar' ? 'تم مسح سجلات الاختراق بنجاح' : 'Historique des intrusions vidé');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Notifications & Custom Delete states
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [deleteCarId, setDeleteCarId] = useState<string | null>(null);

  // Showroom Info Editing States
  const [editAddressAr, setEditAddressAr] = useState(showroomInfo.addressAr);
  const [editAddressFr, setEditAddressFr] = useState(showroomInfo.addressFr);
  const [editPhone, setEditPhone] = useState(showroomInfo.phone);
  const [editHoursAr, setEditHoursAr] = useState(showroomInfo.workHoursAr);
  const [editHoursFr, setEditHoursFr] = useState(showroomInfo.workHoursFr);
  const [editMapTitle, setEditMapTitle] = useState(showroomInfo.mapTitle);
  const [editMapDesc, setEditMapDesc] = useState(showroomInfo.mapDesc);
  const [editMapUrl, setEditMapUrl] = useState(showroomInfo.mapUrl);
  const [editEmail, setEditEmail] = useState(showroomInfo.email || '');
  const [editWhatsApp, setEditWhatsApp] = useState(showroomInfo.whatsapp || '');
  const [editFacebook, setEditFacebook] = useState(showroomInfo.facebook || '');
  const [editInstagram, setEditInstagram] = useState(showroomInfo.instagram || '');
  const [editBrandNameAr, setEditBrandNameAr] = useState(showroomInfo.brandNameAr || '');
  const [editBrandNameFr, setEditBrandNameFr] = useState(showroomInfo.brandNameFr || '');
  const [editHeroTitleAr, setEditHeroTitleAr] = useState(showroomInfo.heroTitleAr || '');
  const [editHeroTitleFr, setEditHeroTitleFr] = useState(showroomInfo.heroTitleFr || '');
  const [editHeroSubtitleAr, setEditHeroSubtitleAr] = useState(showroomInfo.heroSubtitleAr || '');
  const [editHeroSubtitleFr, setEditHeroSubtitleFr] = useState(showroomInfo.heroSubtitleFr || '');
  const [editSloganAr, setEditSloganAr] = useState(showroomInfo.sloganAr || '');
  const [editSloganFr, setEditSloganFr] = useState(showroomInfo.sloganFr || '');
  const [editCustomLogoUrl, setEditCustomLogoUrl] = useState(showroomInfo.customLogoUrl || localStorage.getItem('showroom_custom_logo') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Admin Account Security States
  const [securityEmail, setSecurityEmail] = useState('');
  const [securityPassword, setSecurityPassword] = useState('');
  const [securityPasswordConfirm, setSecurityPasswordConfirm] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');
  const [securityIsError, setSecurityIsError] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Sync edit states when showroomInfo changes
  React.useEffect(() => {
    setEditAddressAr(showroomInfo.addressAr);
    setEditAddressFr(showroomInfo.addressFr);
    setEditPhone(showroomInfo.phone);
    setEditHoursAr(showroomInfo.workHoursAr);
    setEditHoursFr(showroomInfo.workHoursFr);
    setEditMapTitle(showroomInfo.mapTitle);
    setEditMapDesc(showroomInfo.mapDesc);
    setEditMapUrl(showroomInfo.mapUrl);
    setEditEmail(showroomInfo.email || '');
    setEditWhatsApp(showroomInfo.whatsapp || '');
    setEditFacebook(showroomInfo.facebook || '');
    setEditInstagram(showroomInfo.instagram || '');
    setEditBrandNameAr(showroomInfo.brandNameAr || '');
    setEditBrandNameFr(showroomInfo.brandNameFr || '');
    setEditHeroTitleAr(showroomInfo.heroTitleAr || '');
    setEditHeroTitleFr(showroomInfo.heroTitleFr || '');
    setEditHeroSubtitleAr(showroomInfo.heroSubtitleAr || '');
    setEditHeroSubtitleFr(showroomInfo.heroSubtitleFr || '');
    setEditSloganAr(showroomInfo.sloganAr || '');
    setEditSloganFr(showroomInfo.sloganFr || '');
    setEditCustomLogoUrl(showroomInfo.customLogoUrl || localStorage.getItem('showroom_custom_logo') || '');
  }, [showroomInfo]);

  // Detailed Request/Appointment view states
  const [selectedSellRequest, setSelectedSellRequest] = useState<SellRequest | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Persistent notes / comments for staff
  const [staffNotes, setStaffNotes] = useState<{[key: string]: string}>(() => {
    try {
      const saved = localStorage.getItem('adnane_staff_notes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const handleSaveStaffNotes = (id: string, text: string) => {
    const updated = { ...staffNotes, [id]: text };
    setStaffNotes(updated);
    localStorage.setItem('adnane_staff_notes', JSON.stringify(updated));
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage('');
    setSecurityIsError(false);

    if (!securityEmail || !securityPassword || !securityPasswordConfirm) {
      setSecurityIsError(true);
      setSecurityMessage(lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs requis');
      return;
    }

    if (securityPassword !== securityPasswordConfirm) {
      setSecurityIsError(true);
      setSecurityMessage(lang === 'ar' ? 'كلمات المرور غير متطابقة!' : 'Les mots de passe ne correspondent pas !');
      return;
    }

    if (securityPassword.length < 6) {
      setSecurityIsError(true);
      setSecurityMessage(lang === 'ar' ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSecurityLoading(true);
    try {
      const token = localStorage.getItem('adnane_admin_token');
      const response = await fetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newEmail: securityEmail,
          newPassword: securityPassword
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setSecurityIsError(false);
        setSecurityMessage(lang === 'ar' ? 'تم تحديث البريد الإلكتروني وكلمة المرور للوحة التحكم بنجاح!' : 'Vos identifiants d\'administration ont été mis à jour avec succès !');
        setSecurityPassword('');
        setSecurityPasswordConfirm('');
      } else {
        setSecurityIsError(true);
        setSecurityMessage(data.error || (lang === 'ar' ? 'حدث خطأ غير متوقع أثناء التحديث' : 'Une erreur est survenue lors de la mise à jour'));
      }
    } catch (err) {
      setSecurityIsError(true);
      setSecurityMessage(lang === 'ar' ? 'عذراً، فشل الاتصال بالخادم' : 'Échec de la connexion avec le serveur');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleDeleteSellRequest = (id: string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب نهائياً؟' : 'Êtes-vous sûr de vouloir supprimer cette demande de reprise ?')) {
      const updated = sellRequests.filter(r => r.id !== id);
      onUpdateSellRequests(updated);
      if (selectedSellRequest?.id === id) {
        setSelectedSellRequest(null);
      }
    }
  };

  const handleDeleteAppointment = (id: string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الموعد نهائياً؟' : 'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      const updated = appointments.filter(r => r.id !== id);
      onUpdateAppointments(updated);
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(null);
      }
    }
  };

  const handleDeleteFinanceRequest = (id: string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا طلب التمويل نهائياً؟' : 'Êtes-vous sûr de vouloir supprimer cette demande de financement ?')) {
      const updated = financeRequests.filter(r => r.id !== id);
      onUpdateFinanceRequests(updated);
    }
  };

  const handleDeleteAlert = (id: string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا التنبيه نهائياً؟' : 'Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      const updated = alerts.filter(a => a.id !== id);
      onUpdateAlerts(updated);
    }
  };

  const handleUpdateAlertStatus = (id: string, status: 'Contacted' | 'Pending') => {
    const updated = alerts.map(a => a.id === id ? { ...a, status } : a);
    onUpdateAlerts(updated);
  };

  // Cars Management States
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Form states for adding/editing a car
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2018);
  const [price, setPrice] = useState(150000);
  const [km, setKm] = useState(80000);
  const [fuel, setFuel] = useState<'Diesel' | 'Essence' | 'Hybride' | 'Electrique'>('Diesel');
  const [transmission, setTransmission] = useState<'Automatique' | 'Manuelle'>('Automatique');
  const [type, setType] = useState<'SUV' | 'Sedan' | 'Hatchback'>('SUV');
  const [condition, setCondition] = useState<'Excellent' | 'Très bon' | 'Bon'>('Excellent');
  const [color, setColor] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descFr, setDescFr] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVideoDragging, setIsVideoDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setVideoInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddCarModal = () => {
    setEditingCar(null);
    setBrand('');
    setModel('');
    setYear(2018);
    setPrice(150000);
    setKm(80000);
    setFuel('Diesel');
    setTransmission('Automatique');
    setType('SUV');
    setCondition('Excellent');
    setColor('');
    setImageInput('https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80');
    setVideoInput('');
    setFeaturesInput('Climatisation, Toit ouvrant, Caméra de recul, GPS, Apple CarPlay');
    setDescAr('سيارة ممتازة نظيفة جدا وبحالة رائعة.');
    setDescFr('Excellente voiture très propre et en parfait état.');
    setIsCarModalOpen(true);
  };

  const openEditCarModal = (car: Car) => {
    setEditingCar(car);
    setBrand(car.brand);
    setModel(car.model);
    setYear(car.year);
    setPrice(car.price);
    setKm(car.km);
    setFuel(car.fuel);
    setTransmission(car.transmission);
    setType(car.type);
    setCondition(car.condition);
    setColor(car.color);
    setImageInput(car.images[0] || '');
    setVideoInput(car.video || '');
    setFeaturesInput(car.features.join(', '));
    setDescAr(car.descriptionAr);
    setDescFr(car.descriptionFr);
    setIsCarModalOpen(true);
  };

  const handleSaveCar = (e: React.FormEvent) => {
    e.preventDefault();
    const splitFeatures = featuresInput.split(',').map(f => f.trim()).filter(Boolean);
    const newCar: Car = {
      id: editingCar ? editingCar.id : String(Date.now()),
      brand,
      model,
      year: Number(year),
      price: Number(price),
      km: Number(km),
      fuel,
      transmission,
      type,
      condition,
      color,
      images: [imageInput || 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80'],
      video: videoInput || undefined,
      specs: {
        engine: type === 'SUV' ? '2.0L TDI' : '1.6L BlueHDi',
        horsepower: '140 ch',
        fiscalPower: '7 CV',
        doors: 5,
        seats: 5
      },
      features: splitFeatures,
      descriptionAr: descAr,
      descriptionFr: descFr
    };

    if (editingCar) {
      // Edit mode
      const updated = cars.map(c => c.id === editingCar.id ? newCar : c);
      onUpdateCars(updated);
    } else {
      // Create mode
      onUpdateCars([newCar, ...cars]);
    }
    setIsCarModalOpen(false);
  };

  const handleDeleteCar = (id: string) => {
    setDeleteCarId(id);
  };

  // Status handlers for Requests
  const handleUpdateSellStatus = (id: string, status: 'Approved' | 'Rejected') => {
    const updated = sellRequests.map(r => r.id === id ? { ...r, status } : r);
    onUpdateSellRequests(updated);
  };

  const handleUpdateFinanceStatus = (id: string, status: 'Contacted' | 'Approved') => {
    const updated = financeRequests.map(r => r.id === id ? { ...r, status } : r);
    onUpdateFinanceRequests(updated);
  };

  const handleUpdateAppointmentStatus = (id: string, status: 'Completed' | 'Cancelled') => {
    const updated = appointments.map(r => r.id === id ? { ...r, status } : r);
    onUpdateAppointments(updated);
  };

  // Live dynamic notifications compiled from pending requests
  const sellNotifications = sellRequests.filter(r => r.status === 'Pending').map(r => ({
    id: `sell-${r.id}`,
    type: 'sell',
    titleAr: `طلب بيع جديد لـ ${r.brand} ${r.model}`,
    titleFr: `Nouvelle proposition de reprise : ${r.brand} ${r.model}`,
    time: r.createdAt,
    tab: 'sell' as const
  }));

  const appointmentNotifications = appointments.filter(a => a.status === 'Scheduled').map(a => ({
    id: `app-${a.id}`,
    type: 'appointment',
    titleAr: `موعد حجز بالمعرض من ${a.name}`,
    titleFr: `Nouveau RDV programmé par ${a.name}`,
    time: `${a.date} à ${a.time}`,
    tab: 'appointments' as const
  }));

  const allNotifications = [...sellNotifications, ...appointmentNotifications];
  const unreadNotifications = allNotifications.filter(n => !readNotifications.includes(n.id));

  const isRtl = lang === 'ar';

  return (
    <div 
      id="cms-dashboard" 
      className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans"
      style={{ direction: isRtl ? 'rtl' : 'ltr' }}
    >
      {/* Sidebar - Falcon inspired */}
      <aside className={`bg-[#0F172A] text-slate-300 w-64 fixed md:relative z-30 min-h-screen transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo variant="dark" height="42px" className="!justify-start" />
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 mb-2">
            {lang === 'ar' ? 'رئيسي' : 'PRINCIPAL'}
          </p>
          
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'overview' ? 'bg-rose-500/10 text-rose-400 border-r-4 border-rose-500' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{lang === 'ar' ? 'لوحة المراقبة العامة' : 'Tableau de bord'}</span>
          </button>

          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 pt-6 mb-2">
            {lang === 'ar' ? 'إدارة المخزون والطلبات' : 'GESTION'}
          </p>

          <button 
            onClick={() => setActiveTab('cars')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'cars' ? 'bg-rose-500/10 text-rose-400 border-r-4 border-rose-500' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CarIcon className="h-4 w-4" />
            <span>{lang === 'ar' ? 'إدارة معرض السيارات' : 'Gestion des Voitures'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('sell')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'sell' ? 'bg-rose-500/10 text-rose-400 border-r-4 border-rose-500' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{lang === 'ar' ? 'طلبات بيع السيارات' : 'Demandes de Vente'}</span>
            {sellRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-auto">
                {sellRequests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'appointments' ? 'bg-rose-500/10 text-rose-400 border-r-4 border-rose-500' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{lang === 'ar' ? 'حجوزات المواعيد المعرض' : 'Rendez-vous Showroom'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'reviews' ? 'bg-rose-500/10 text-rose-400 border-r-4 border-rose-500' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="h-4 w-4" />
            <span>{lang === 'ar' ? 'إدارة آراء وتقييمات الزوار' : 'Avis et Commentaires'}</span>
            <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
              {reviews.length}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('showroom')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'showroom' ? 'bg-rose-500/10 text-rose-400 border-r-4 border-rose-500' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>{lang === 'ar' ? 'بيانات ومعلومات المعرض' : 'Données du Showroom'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'security' ? 'bg-rose-500/10 text-rose-400 border-r-4 border-rose-500' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>{lang === 'ar' ? 'إعدادات الأمان والحساب' : 'Sécurité & Identifiants'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('intrusion_security')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'intrusion_security' ? 'bg-rose-500/10 text-rose-400 border-r-4 border-rose-500' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>{lang === 'ar' ? 'مراقبة الاختراق والأمان' : 'Sécurité & Intrusions'}</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden md:pl-0">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-100 h-16 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 w-64">
              <Search className="h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'البحث السريع...' : 'Rechercher...'} 
                className="bg-transparent text-xs outline-none w-full text-gray-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-rose-50 text-rose-600 rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'المدير عدنان' : 'Admin Adnane'}</span>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-50 relative transition cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute top-12 ${isRtl ? 'left-0' : 'right-0'} w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-150`}>
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">
                      {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                    </span>
                    {unreadNotifications.length > 0 && (
                      <button 
                        onClick={() => setReadNotifications([...readNotifications, ...allNotifications.map(n => n.id)])}
                        className="text-[10px] text-rose-500 hover:underline font-bold"
                      >
                        {lang === 'ar' ? 'مقروء الكل' : 'Tout marquer'}
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    {allNotifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">
                        {lang === 'ar' ? 'لا توجد إشعارات حالياً' : 'Aucune notification'}
                      </div>
                    ) : (
                      allNotifications.map((notif) => {
                        const isUnread = !readNotifications.includes(notif.id);
                        return (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              setActiveTab(notif.tab as any);
                              setShowNotifications(false);
                              if (isUnread) {
                                setReadNotifications([...readNotifications, notif.id]);
                              }
                            }}
                            className={`p-3 text-xs cursor-pointer transition hover:bg-rose-50/10 flex items-start gap-2.5 ${isUnread ? 'bg-rose-50/20 font-semibold' : ''}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${isUnread ? 'bg-rose-500' : 'bg-transparent'}`}></span>
                            <div className="flex-1">
                              <p className="text-gray-800 leading-normal">{lang === 'ar' ? notif.titleAr : notif.titleFr}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-6 sm:p-8 flex-1">
          
          {/* TAB 1: OVERVIEW (Falcon Style) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {lang === 'ar' ? 'مرحباً بعودتك، عدنان أوتو!' : 'Tableau de Bord Général'}
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'ar' ? 'إليك نظرة سريعة على إحصائيات المعرض والمبيعات لمراكش.' : 'Aperçu analytique complet en temps réel.'}
                  </p>
                </div>
              </div>

              {/* Grid Cards (Falcon style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Total Orders */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {lang === 'ar' ? 'الطلبات النشطة' : 'Active Orders'}
                      </p>
                      <h3 className="text-2xl font-extrabold text-gray-800 mt-1">
                        {sellRequests.length + appointments.length}
                      </h3>
                    </div>
                    <span className="p-2 bg-sky-50 text-sky-600 rounded-xl text-xs font-bold">+12.4%</span>
                  </div>
                  {/* Mock wave chart */}
                  <div className="h-10 mt-6 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 20">
                      <path d="M0,10 Q15,0 30,10 T60,10 T90,5 T100,10" fill="none" stroke="#F43F5E" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Market Share */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {lang === 'ar' ? 'سيارات في المعرض' : 'Vehicles in Stock'}
                      </p>
                      <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{cars.length} {lang === 'ar' ? 'سيارة' : 'Voitures'}</h3>
                    </div>
                    <span className="p-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-bold">100% OK</span>
                  </div>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600">75%</span>
                  </div>
                </div>

                {/* Weather Marrakech */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {lang === 'ar' ? 'طقس مراكش اليوم' : 'Météo Marrakech'}
                      </p>
                      <h3 className="text-2xl font-extrabold text-gray-800 mt-1">34°C</h3>
                    </div>
                    <CloudSun className="h-8 w-8 text-amber-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-6">
                    {lang === 'ar' ? 'مشمس - وقت رائع لبيع وعرض السيارات' : 'Ensoleillé - Idéal pour le Showroom'}
                  </p>
                </div>

              </div>

              {/* Recent Activity / Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Pending Sell requests list */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 text-sm">
                      {lang === 'ar' ? 'طلبات البيع والاستبدال الأخيرة' : 'Demandes de Vente Récentes'}
                    </h3>
                    <span className="text-xs text-rose-500 font-bold hover:underline cursor-pointer" onClick={() => setActiveTab('sell')}>
                      {lang === 'ar' ? 'عرض الكل' : 'Voir tout'}
                    </span>
                  </div>
                  <div className="space-y-3.5">
                    {sellRequests.length === 0 ? (
                      <p className="text-xs text-gray-400 py-6 text-center">Aucune demande.</p>
                    ) : (
                      sellRequests.slice(0, 4).map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <p className="text-xs font-bold text-gray-800">{req.brand} {req.model}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{req.km} km • {req.year} • {req.priceRequested} DHS</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming Appointments list */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 text-sm">
                      {lang === 'ar' ? 'المواعيد القادمة بالمعرض' : 'Prochains Rendez-vous'}
                    </h3>
                    <span className="text-xs text-rose-500 font-bold hover:underline cursor-pointer" onClick={() => setActiveTab('appointments')}>
                      {lang === 'ar' ? 'عرض الكل' : 'Voir tout'}
                    </span>
                  </div>
                  <div className="space-y-3.5">
                    {appointments.length === 0 ? (
                      <p className="text-xs text-gray-400 py-6 text-center">Aucun rendez-vous planifié.</p>
                    ) : (
                      appointments.slice(0, 4).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <p className="text-xs font-bold text-gray-800">{app.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{app.date} à {app.time} • {app.carName}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            app.status === 'Scheduled' ? 'bg-sky-100 text-sky-700' :
                            app.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: MANAGE CARS */}
          {activeTab === 'cars' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    {lang === 'ar' ? 'معرض سيارات Adnane Auto' : 'Gestion du Catalogue'}
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'ar' ? 'أضف، عدل، أو احذف السيارات من الموقع فورياً.' : 'Ajoutez, modifiez ou retirez des voitures du showroom virtuel.'}
                  </p>
                </div>
                <button 
                  onClick={openAddCarModal}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer shadow-lg shadow-rose-100 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'إضافة سيارة جديدة' : 'Ajouter une voiture'}</span>
                </button>
              </div>

              {/* Table of cars */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-500" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">{lang === 'ar' ? 'السيارة' : 'Véhicule'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'المواصفات' : 'Spécifications'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'الوقود / ناقل الحركة' : 'Carburant / Transmission'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'المسافة' : 'Kilométrage'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'السعر' : 'Prix'}</th>
                        <th className="px-6 py-4 text-center">{lang === 'ar' ? 'العمليات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cars.map((car) => (
                        <tr key={car.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 flex items-center gap-3 font-semibold text-gray-900">
                            <img src={car.images[0]} alt={car.model} className="h-10 w-16 object-cover rounded-lg border" />
                            <div>
                              <p className="text-xs font-bold">{car.brand} {car.model}</p>
                              <p className="text-[10px] text-rose-500">{car.year}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{car.type} • {car.condition}</td>
                          <td className="px-6 py-4 text-gray-600">{car.fuel} • {car.transmission}</td>
                          <td className="px-6 py-4 text-gray-600">{car.km.toLocaleString()} km</td>
                          <td className="px-6 py-4 font-bold text-gray-900">{car.price.toLocaleString()} DHS</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openEditCarModal(car)}
                                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition"
                                title="Modifier"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteCar(car.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SELL REQUESTS */}
          {activeTab === 'sell' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {lang === 'ar' ? 'طلبات بيع السيارات (Reprise)' : 'Demandes de Reprise / Vente'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'ar' ? 'طلبات البيع والاستبدال المقدمة من العملاء عبر الموقع.' : 'Suivez les propositions de reprise reçues directement de la part des utilisateurs.'}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-500" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">{lang === 'ar' ? 'السيارة المقترحة' : 'Véhicule'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'معلومات العميل' : 'Coordonnées'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'الحالة والممشى' : 'Kilométrage / État'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'السعر المقترح' : 'Prix demandé'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'حالة الطلب' : 'Statut'}</th>
                        <th className="px-6 py-4 text-center">{lang === 'ar' ? 'التحكم والعمليات' : 'Contrôles & Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sellRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold text-gray-900">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                req.requestType === 'Reprise'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {req.requestType === 'Reprise' ? (lang === 'ar' ? '🔄 استبدال Reprise' : '🔄 Reprise') : (lang === 'ar' ? '🏷️ بيع Vente' : '🏷️ Vente Directe')}
                              </span>
                            </div>
                            <div>{req.brand} {req.model} ({req.year})</div>
                            {req.targetCarName && (
                              <p className="text-[10px] text-gray-500 mt-0.5 font-normal">
                                {lang === 'ar' ? 'مقابل: ' : 'Contre : '} <span className="font-semibold text-rose-600">{req.targetCarName}</span>
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span>{req.phone}</span>
                              {req.phoneVerified && (
                                <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Numéro vérifié par SMS">
                                  ✓
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400">{req.city}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {req.km.toLocaleString()} km • {req.condition}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">{req.priceRequested.toLocaleString()} DHS</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                              req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedSellRequest(req)}
                                className="flex items-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition duration-150 cursor-pointer"
                                title={lang === 'ar' ? 'عرض التفاصيل والصور' : 'Détails & Photos'}
                              >
                                <Eye className="h-3.5 w-3.5 shrink-0" />
                                <span>{lang === 'ar' ? 'التفاصيل والصور' : 'Détails'}</span>
                              </button>
                              
                              <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded-xl border border-gray-200">
                                <button 
                                  onClick={() => handleUpdateSellStatus(req.id, 'Approved')}
                                  className={`p-1 rounded-lg transition cursor-pointer ${req.status === 'Approved' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                  title={lang === 'ar' ? 'موافقة' : 'Approuver'}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateSellStatus(req.id, 'Rejected')}
                                  className={`p-1 rounded-lg transition cursor-pointer ${req.status === 'Rejected' ? 'bg-rose-500 text-white' : 'text-gray-500 hover:text-rose-600 hover:bg-rose-50'}`}
                                  title={lang === 'ar' ? 'رفض' : 'Rejeter'}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => handleDeleteSellRequest(req.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                title={lang === 'ar' ? 'حذف الطلب' : 'Supprimer'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* TAB 5: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {lang === 'ar' ? 'حجوزات المواعيد بالمعرض' : 'Rendez-vous Showroom'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'ar' ? 'تنظيم مواعيد زيارات العملاء وتجارب القيادة للسيارات.' : 'Suivez et gérez l\'agenda des rendez-vous d\'essai avec les clients.'}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-500" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                    <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'السيارة' : 'Véhicule'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'التاريخ والوقت' : 'Date & Heure'}</th>
                        <th className="px-6 py-4">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                        <th className="px-6 py-4 text-center">{lang === 'ar' ? 'تعديل الحالة والتحكم' : 'Actions & Contrôles'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {appointments.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold text-gray-900">
                            <p className="font-semibold">{app.name}</p>
                            <p className="text-[10px] text-gray-400">{app.phone}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium">{app.carName}</td>
                          <td className="px-6 py-4 text-gray-600 font-semibold">{app.date} à {app.time}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                              app.status === 'Scheduled' ? 'bg-sky-100 text-sky-700' :
                              app.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedAppointment(app)}
                                className="flex items-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition duration-150 cursor-pointer"
                                title={lang === 'ar' ? 'عرض التفاصيل والتعليقات' : 'Détails & Notes'}
                              >
                                <Eye className="h-3.5 w-3.5 shrink-0" />
                                <span>{lang === 'ar' ? 'التفاصيل والتعليقات' : 'Détails'}</span>
                              </button>

                              <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded-xl border border-gray-200">
                                <button 
                                  onClick={() => handleUpdateAppointmentStatus(app.id, 'Completed')}
                                  className={`p-1 rounded-lg transition cursor-pointer ${app.status === 'Completed' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                  title={lang === 'ar' ? 'مكتمل' : 'Complété'}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateAppointmentStatus(app.id, 'Cancelled')}
                                  className={`p-1 rounded-lg transition cursor-pointer ${app.status === 'Cancelled' ? 'bg-rose-500 text-white' : 'text-gray-500 hover:text-rose-600 hover:bg-rose-50'}`}
                                  title={lang === 'ar' ? 'إلغاء' : 'Annuler'}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => handleDeleteAppointment(app.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                title={lang === 'ar' ? 'حذف الموعد' : 'Supprimer'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LEADS & ALERTS */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {lang === 'ar' ? 'طلبات التمويل والتنبيهات الذكية' : 'Financements & Alertes'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'ar' ? 'إدارة طلبات تمويل السيارات وحسابات القروض، بالإضافة إلى تنبيهات السيارات المطلوبة من الزوار.' : 'Gérez les demandes de financement et les alertes de recherche personnalisées des clients.'}
                </p>
              </div>

              {/* Toggle Buttons */}
              <div className="flex gap-2 border-b border-gray-200 pb-px">
                <button
                  onClick={() => setLeadsSubTab('finance')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                    leadsSubTab === 'finance'
                      ? 'border-rose-500 text-rose-600 font-extrabold'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {lang === 'ar' ? `طلبات التمويل (${financeRequests.length})` : `Financements (${financeRequests.length})`}
                </button>
                <button
                  onClick={() => setLeadsSubTab('alerts')}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                    leadsSubTab === 'alerts'
                      ? 'border-rose-500 text-rose-600 font-extrabold'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {lang === 'ar' ? `التنبيهات الذكية (${alerts.length})` : `Alertes Voitures (${alerts.length})`}
                </button>
              </div>

              {leadsSubTab === 'finance' ? (
                /* Finance requests list */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-500" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                      <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                          <th className="px-6 py-4">{lang === 'ar' ? 'السيارة والتكلفة' : 'Véhicule & Prix'}</th>
                          <th className="px-6 py-4">{lang === 'ar' ? 'الدفع الأولي والمدة' : 'Apport / Durée'}</th>
                          <th className="px-6 py-4">{lang === 'ar' ? 'القسط الشهري' : 'Mensualité'}</th>
                          <th className="px-6 py-4">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                          <th className="px-6 py-4 text-center">{lang === 'ar' ? 'التحكم والعمليات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {financeRequests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-400 font-medium">
                              {lang === 'ar' ? 'لا توجد طلبات تمويل حالياً.' : 'Aucune demande de financement reçue.'}
                            </td>
                          </tr>
                        ) : (
                          financeRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-bold text-gray-900">
                                <p className="font-semibold">{req.name}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{req.phone}</p>
                                <p className="text-[9px] text-gray-300">{req.createdAt}</p>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                <p className="font-bold text-gray-800">{req.carName}</p>
                                <p className="text-[10px] text-gray-400">{req.carPrice.toLocaleString()} DHS</p>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-medium">
                                <p>{lang === 'ar' ? 'دفع مسبق: ' : 'Apport: '}{req.downPayment.toLocaleString()} DHS</p>
                                <p className="text-gray-400">{req.durationMonths} {lang === 'ar' ? 'شهراً' : 'mois'}</p>
                              </td>
                              <td className="px-6 py-4 text-rose-600 font-extrabold text-sm">
                                {req.monthlyPayment.toLocaleString()} DHS/{lang === 'ar' ? 'شهر' : 'mois'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                                  req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                  req.status === 'Contacted' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded-xl border border-gray-200">
                                    <button 
                                      onClick={() => handleUpdateFinanceStatus(req.id, 'Contacted')}
                                      className={`p-1 rounded-lg transition cursor-pointer ${req.status === 'Contacted' ? 'bg-sky-500 text-white' : 'text-gray-500 hover:text-sky-600 hover:bg-sky-50'}`}
                                      title={lang === 'ar' ? 'تم الاتصال' : 'Contacté'}
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateFinanceStatus(req.id, 'Approved')}
                                      className={`p-1 rounded-lg transition cursor-pointer ${req.status === 'Approved' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                      title={lang === 'ar' ? 'موافق عليه' : 'Approuver'}
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteFinanceRequest(req.id)}
                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                    title={lang === 'ar' ? 'حذف' : 'Supprimer'}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Smart Alerts list */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-500" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                      <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4">{lang === 'ar' ? 'السيارة المطلوبة' : 'Véhicule recherché'}</th>
                          <th className="px-6 py-4">{lang === 'ar' ? 'رقم الهاتف' : 'N° Téléphone'}</th>
                          <th className="px-6 py-4">{lang === 'ar' ? 'تاريخ التسجيل' : 'Date d\'inscription'}</th>
                          <th className="px-6 py-4">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                          <th className="px-6 py-4 text-center">{lang === 'ar' ? 'التحكم والعمليات' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {alerts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-medium">
                              {lang === 'ar' ? 'لا توجد تنبيهات ذكية مسجلة حالياً.' : 'Aucune alerte enregistrée.'}
                            </td>
                          </tr>
                        ) : (
                          alerts.map((al) => (
                            <tr key={al.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-extrabold text-gray-900 text-sm">
                                {al.brand}
                              </td>
                              <td className="px-6 py-4 font-semibold text-gray-700 font-mono">
                                {al.phone}
                              </td>
                              <td className="px-6 py-4 text-gray-400">
                                {al.createdAt}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                                  al.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                                }`}>
                                  {al.status === 'Pending' ? (lang === 'ar' ? 'قيد الانتظار' : 'En attente') : (lang === 'ar' ? 'تم التواصل' : 'Contacté')}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded-xl border border-gray-200">
                                    <button 
                                      onClick={() => handleUpdateAlertStatus(al.id, al.status === 'Pending' ? 'Contacted' : 'Pending')}
                                      className={`p-1 rounded-lg transition cursor-pointer ${al.status === 'Contacted' ? 'bg-sky-500 text-white' : 'text-gray-500 hover:text-sky-600 hover:bg-sky-50'}`}
                                      title={lang === 'ar' ? 'تغيير الحالة' : 'Changer statut'}
                                    >
                                      {al.status === 'Pending' ? <Phone className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteAlert(al.id)}
                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                    title={lang === 'ar' ? 'حذف' : 'Supprimer'}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: VISITOR REVIEWS MANAGEMENT */}
          {activeTab === 'reviews' && (() => {
            const avgRating = reviews.length > 0 
              ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
              : '5.0';
            const repliedCount = reviews.filter(r => r.replyAr || r.replyFr).length;
            const pinnedCount = reviews.filter(r => r.isPinned).length;

            const filteredReviewsList = reviews.filter(r => {
              const matchesRating = reviewFilterRating === 'all' || r.rating === reviewFilterRating;
              const textToSearch = `${r.name} ${r.city} ${r.commentAr || ''} ${r.commentFr || ''} ${r.replyAr || ''} ${r.replyFr || ''}`.toLowerCase();
              const matchesSearch = !reviewSearchQuery.trim() || textToSearch.includes(reviewSearchQuery.toLowerCase().trim());
              return matchesRating && matchesSearch;
            });

            const presetRepliesAr = [
              'نشكرك جزيل الشكر على ثقتك الغالية في معرض عدنان أوتو بمدينة مراكش! يسعدنا دائماً تقديم أفضل خدمة لكم.',
              'مبروك عليك السيارة الجديدة! سعداء جداً بتعاملكم معنا ونتمنى لكم سياقة آمنة وممتعة.',
              'شكراً لشهادتكم الطيبة وتقييمكم الرائع، نعتز بخدمتكم ونسعى دائماً للحفاظ على أعلى معايير الجودة والشفافية.'
            ];

            const presetRepliesFr = [
              'Merci infiniment pour votre confiance envers Adnane Auto Marrakech ! C\'est un plaisir de vous servir.',
              'Félicitations pour votre nouveau véhicule ! Toute l\'équipe vous souhaite une excellente route.',
              'Merci pour votre excellent retour ! Nous veillons toujours à vous offrir la meilleure qualité de service.'
            ];

            const handleSaveOfficialReply = (revId: string) => {
              if (!replyTextAr.trim() && !replyTextFr.trim()) return;
              const todayStr = new Date().toISOString().split('T')[0];
              onUpdateReviews(
                reviews.map(r => r.id === revId ? {
                  ...r,
                  replyAr: replyTextAr.trim() || replyTextFr.trim(),
                  replyFr: replyTextFr.trim() || replyTextAr.trim(),
                  repliedAt: todayStr
                } : r)
              );
              setReplyingReviewId(null);
              setReplyTextAr('');
              setReplyTextFr('');
            };

            const handleDeleteOfficialReply = (revId: string) => {
              if (confirm(lang === 'ar' ? 'هل تريد حذف الرد الإداري؟' : 'Supprimer la réponse officielle ?')) {
                onUpdateReviews(
                  reviews.map(r => r.id === revId ? {
                    ...r,
                    replyAr: undefined,
                    replyFr: undefined,
                    repliedAt: undefined
                  } : r)
                );
              }
            };

            const handleTogglePinReview = (revId: string) => {
              onUpdateReviews(
                reviews.map(r => r.id === revId ? { ...r, isPinned: !r.isPinned } : r)
              );
            };

            const handleToggleVerifiedReview = (revId: string) => {
              onUpdateReviews(
                reviews.map(r => r.id === revId ? { ...r, isVerifiedCustomer: r.isVerifiedCustomer === false ? true : false } : r)
              );
            };

            return (
              <div className="space-y-6" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                {/* HEADER TITLE & STATS SUMMARY */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <MessageSquare className="h-6 w-6 text-rose-500" />
                      <span>{lang === 'ar' ? 'إدارة التفاعلات وآراء زوار المعرض' : 'Gestion & Interactions Avis Clients'}</span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                      {lang === 'ar' 
                        ? 'الرد على تعليقات الزبناء، تثبيت التقييمات المميزة في الأعلى، وتوثيق الزبناء الحقيقيين.' 
                        : 'Répondez aux avis, épinglez les commentaires pertinents et certifiez les clients vérifiés.'}
                    </p>
                  </div>

                  {/* QUICK STATS PILLS */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-white border border-gray-200 px-3.5 py-1.5 rounded-2xl shadow-xs text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                      <span>{lang === 'ar' ? `العدد: ${reviews.length}` : `Total : ${reviews.length}`}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl shadow-xs text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>{avgRating} / 5</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl shadow-xs text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <MessageCircleReply className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{lang === 'ar' ? `المردود عليها: ${repliedCount}` : `Répondus : ${repliedCount}`}</span>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-2xl shadow-xs text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                      <Pin className="h-3.5 w-3.5 text-indigo-600 fill-indigo-500" />
                      <span>{lang === 'ar' ? `المثبتة: ${pinnedCount}` : `Épinglés : ${pinnedCount}`}</span>
                    </div>
                  </div>
                </div>

                {/* SEARCH AND FILTERS TOOLBAR */}
                <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Search bar */}
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      placeholder={lang === 'ar' ? 'بحث بالاسم، المدينة أو النص...' : 'Recherche par nom, ville...'}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-2 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
                    />
                  </div>

                  {/* Rating filter pills */}
                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setReviewFilterRating('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        reviewFilterRating === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {lang === 'ar' ? 'الكل' : 'Tous'} ({reviews.length})
                    </button>
                    {[5, 4, 3, 2, 1].map((st) => (
                      <button
                        key={st}
                        onClick={() => setReviewFilterRating(st)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                          reviewFilterRating === st
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60'
                        }`}
                      >
                        <span>{st}</span>
                        <Star className={`h-3 w-3 ${reviewFilterRating === st ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* REVIEWS CARDS CONTAINER */}
                <div className="space-y-4">
                  {filteredReviewsList.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-gray-400 space-y-3">
                      <MessageSquare className="h-10 w-10 text-gray-300 mx-auto" />
                      <p className="text-sm font-bold">
                        {lang === 'ar' ? 'لا توجد تقييمات تطابق معايير البحث' : 'Aucun avis ne correspond'}
                      </p>
                    </div>
                  ) : (
                    filteredReviewsList.map((rev) => {
                      const isReplying = replyingReviewId === rev.id;
                      const hasReply = !!(rev.replyAr || rev.replyFr);

                      return (
                        <div
                          key={rev.id}
                          className={`bg-white rounded-3xl border transition shadow-xs hover:shadow-md p-5 space-y-4 ${
                            rev.isPinned
                              ? 'border-indigo-300 bg-indigo-50/20'
                              : 'border-gray-200/80 hover:border-gray-300'
                          }`}
                        >
                          {/* TOP CARD BAR: AUTHOR, BADGES, RATING */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center border shrink-0 ${
                                (rev.name ? rev.name.charCodeAt(0) : 0) % 4 === 0 
                                  ? 'bg-rose-500 text-white border-rose-200'
                                  : (rev.name ? rev.name.charCodeAt(0) : 0) % 4 === 1
                                  ? 'bg-indigo-600 text-white border-indigo-200'
                                  : (rev.name ? rev.name.charCodeAt(0) : 0) % 4 === 2
                                  ? 'bg-emerald-600 text-white border-emerald-200'
                                  : 'bg-slate-800 text-white border-slate-300'
                              }`}>
                                {rev.name ? rev.name.trim().charAt(0) : 'ز'}
                              </div>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-extrabold text-sm text-gray-900">{rev.name}</h3>
                                  
                                  {/* Verified Badge */}
                                  <button
                                    onClick={() => handleToggleVerifiedReview(rev.id)}
                                    title={lang === 'ar' ? 'تبديل حالة توثيق العميل' : 'Changer statut de vérification'}
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                                      rev.isVerifiedCustomer !== false
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                    }`}
                                  >
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                    <span>{rev.isVerifiedCustomer !== false ? (lang === 'ar' ? 'عميل موثق' : 'Vérifié') : (lang === 'ar' ? 'غير موثق' : 'Non vérifié')}</span>
                                  </button>

                                  {/* Pinned Badge */}
                                  {rev.isPinned && (
                                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-lg border border-indigo-200">
                                      <Pin className="h-3 w-3 text-indigo-600 fill-indigo-500" />
                                      <span>{lang === 'ar' ? 'مثبّت في الأعلى' : 'Épinglé'}</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5 font-medium">
                                  <span>📍 {rev.city}</span>
                                  {rev.createdAt && <span>• 🗓️ {rev.createdAt}</span>}
                                </div>
                              </div>
                            </div>

                            {/* STAR RATING */}
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl shrink-0 self-start sm:self-auto">
                              <span className="font-black text-amber-700 text-xs">{rev.rating} / 5</span>
                              <div className="flex text-amber-400 gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < rev.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300 fill-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* USER COMMENT TEXT */}
                          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
                            "{isRtl ? (rev.commentAr || rev.commentFr) : (rev.commentFr || rev.commentAr)}"
                          </div>

                          {/* EXISTING OFFICIAL SHOWROOM REPLY DISPLAY */}
                          {hasReply && !isReplying && (
                            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800 shadow-xs">
                              <div className="flex items-center justify-between text-rose-400 font-extrabold text-xs">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-rose-400" />
                                  <span>{lang === 'ar' ? 'رد إدارة معرض عدنان أوتو:' : 'Réponse officielle de la Direction :'}</span>
                                </div>
                                {rev.repliedAt && (
                                  <span className="text-[10px] text-slate-400 font-medium">{rev.repliedAt}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                                {isRtl ? (rev.replyAr || rev.replyFr) : (rev.replyFr || rev.replyAr)}
                              </p>
                              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800 text-[11px]">
                                <button
                                  onClick={() => {
                                    setReplyingReviewId(rev.id);
                                    setReplyTextAr(rev.replyAr || '');
                                    setReplyTextFr(rev.replyFr || '');
                                  }}
                                  className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <Edit3 className="h-3 w-3" />
                                  <span>{lang === 'ar' ? 'تعديل الرد' : 'Modifier'}</span>
                                </button>
                                <span className="text-slate-700">•</span>
                                <button
                                  onClick={() => handleDeleteOfficialReply(rev.id)}
                                  className="text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>{lang === 'ar' ? 'حذف الرد' : 'Supprimer'}</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* INLINE REPLY EDITOR BOX */}
                          {isReplying && (
                            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-extrabold text-xs text-rose-900 flex items-center gap-1.5">
                                  <MessageCircleReply className="h-4 w-4 text-rose-600" />
                                  <span>{lang === 'ar' ? 'كتابة رد رسمي على هذا التعليق' : 'Rédiger une réponse officielle'}</span>
                                </h4>
                                <button
                                  onClick={() => setReplyingReviewId(null)}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              {/* PRESET QUICK REPLIES */}
                              <div>
                                <label className="block text-[11px] font-bold text-rose-800 mb-1.5">
                                  {lang === 'ar' ? 'اختر رد جاهز سريع (اختياري):' : 'Réponses prédéfinies :'}
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                  {(lang === 'ar' ? presetRepliesAr : presetRepliesFr).map((preset, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setReplyTextAr(presetRepliesAr[idx]);
                                        setReplyTextFr(presetRepliesFr[idx]);
                                      }}
                                      className="text-[10px] bg-white border border-rose-200 text-rose-800 hover:bg-rose-100/70 font-semibold px-2.5 py-1 rounded-xl transition cursor-pointer"
                                    >
                                      💬 {preset.substring(0, 35)}...
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* ARABIC REPLY INPUT */}
                              <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                  {lang === 'ar' ? 'نص الرد باللغة العربية:' : 'Réponse en arabe :'}
                                </label>
                                <textarea
                                  rows={2}
                                  value={replyTextAr}
                                  onChange={(e) => setReplyTextAr(e.target.value)}
                                  placeholder={lang === 'ar' ? 'اكتب رد إدارة معرض عدنان أوتو باللغة العربية...' : 'Texte de réponse en arabe...'}
                                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                                />
                              </div>

                              {/* FRENCH REPLY INPUT */}
                              <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                  {lang === 'ar' ? 'نص الرد باللغة الفرنسية (اختياري):' : 'Réponse en français :'}
                                </label>
                                <textarea
                                  rows={2}
                                  value={replyTextFr}
                                  onChange={(e) => setReplyTextFr(e.target.value)}
                                  placeholder={lang === 'ar' ? 'اكتب الرد بالفرنسية للعملاء الناطقين بالفرنسية...' : 'Texte de réponse en français...'}
                                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
                                />
                              </div>

                              {/* ACTION BUTTONS */}
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  onClick={() => setReplyingReviewId(null)}
                                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                                >
                                  {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                                </button>
                                <button
                                  onClick={() => handleSaveOfficialReply(rev.id)}
                                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  <span>{lang === 'ar' ? 'حفظ ونشر الرد' : 'Publier la réponse'}</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* BOTTOM ACTION TOOLBAR */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Reply button */}
                              <button
                                onClick={() => {
                                  if (isReplying) {
                                    setReplyingReviewId(null);
                                  } else {
                                    setReplyingReviewId(rev.id);
                                    setReplyTextAr(rev.replyAr || '');
                                    setReplyTextFr(rev.replyFr || '');
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  hasReply
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80'
                                }`}
                              >
                                <MessageCircleReply className="h-3.5 w-3.5" />
                                <span>{hasReply ? (lang === 'ar' ? 'تعديل الرد الإداري' : 'Modifier la réponse') : (lang === 'ar' ? 'إضافة رد إداري' : 'Répondre')}</span>
                              </button>

                              {/* Pin / Unpin Button */}
                              <button
                                onClick={() => handleTogglePinReview(rev.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  rev.isPinned
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                                title={lang === 'ar' ? 'تثبيت التقييم في أعلى قائمة الزوار' : 'Épingler cet avis'}
                              >
                                <Pin className={`h-3.5 w-3.5 ${rev.isPinned ? 'fill-amber-600 text-amber-600' : ''}`} />
                                <span>{rev.isPinned ? (lang === 'ar' ? 'إلغاء التثبيت' : 'Désépingler') : (lang === 'ar' ? 'تثبيت بالقمة 📌' : 'Épingler')}</span>
                              </button>

                              {/* Toggle Verified Customer */}
                              <button
                                onClick={() => handleToggleVerifiedReview(rev.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  rev.isVerifiedCustomer !== false
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span>{rev.isVerifiedCustomer !== false ? (lang === 'ar' ? 'عميل موثق ✔️' : 'Vérifié') : (lang === 'ar' ? 'توثيق العميل' : 'Certifier')}</span>
                              </button>
                            </div>

                            {/* Delete Review Button */}
                            <button
                              onClick={() => {
                                if (confirm(lang === 'ar' ? 'هل أنت تأكد من حذف هذا التعليق نهائياً؟' : 'Voulez-vous vraiment supprimer cet avis ?')) {
                                  onUpdateReviews(reviews.filter(r => r.id !== rev.id));
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                              title={lang === 'ar' ? 'حذف التعليق' : 'Supprimer'}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>{lang === 'ar' ? 'حذف' : 'Supprimer'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB 6: SHOWROOM DETAILS SETTINGS */}
          {activeTab === 'showroom' && (
            <div className="space-y-6" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {lang === 'ar' ? 'بيانات ومعلومات المعرض' : 'Informations du Showroom'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'ar' ? 'تعديل العنوان، أرقام الهاتف، ساعات العمل، وموقع الخريطة الذي يظهر للزوار.' : 'Modifiez l\'adresse, le téléphone, les horaires et la carte GPS affichés aux visiteurs.'}
                </p>
              </div>

              {saveSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>
                    {lang === 'ar' ? 'تم حفظ التغييرات بنجاح وتحديث الموقع بالكامل!' : 'Les modifications ont été enregistrées avec succès et appliquées sur tout le site !'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form fields */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                  {/* Logo Management Section */}
                  <div className="space-y-4 bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-rose-500" />
                        <span>{lang === 'ar' ? 'رفع وإدارة شعار المعرض (Logo)' : 'Gestion du Logo du Showroom'}</span>
                      </h3>
                      {editCustomLogoUrl ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>{lang === 'ar' ? 'شعار مخصص مرفوع' : 'Logo personnalisé actif'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-gray-200 text-gray-700">
                          <span>{lang === 'ar' ? 'الشعار النصي الافتراضي' : 'Logo texte par défaut'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Live Preview Box */}
                      <div className="w-full sm:w-56 h-28 bg-white rounded-2xl border-2 border-dashed border-gray-300 p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-xs">
                        {editCustomLogoUrl ? (
                          <img 
                            src={editCustomLogoUrl} 
                            alt="Showroom Custom Logo" 
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1.5 text-center text-xs font-semibold text-gray-400 p-2">
                            <Upload className="h-5 w-5 text-gray-400 stroke-[1.5]" />
                            <span>{lang === 'ar' ? 'لا يوجد شعار مرفوع بعد' : 'Aucun logo téléversé'}</span>
                          </div>
                        )}
                      </div>

                      {/* Buttons & Instructions */}
                      <div className="space-y-2.5 flex-1 w-full text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                          {lang === 'ar'
                            ? 'اختر صورة الشعار الخاص بمعرضكم (PNG, JPG, SVG) لتبديل الشعار في الهيدر والفوتر واللوحة مباشرة.'
                            : 'Téléversez l\'image de votre logo (PNG, JPG, SVG) pour l\'appliquer instantanément.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                          {/* Upload Button */}
                          <label className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer">
                            <Upload className="h-4 w-4" />
                            <span>{lang === 'ar' ? 'رفع شعار جديد' : 'Téléverser un logo'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    const base64 = evt.target?.result as string;
                                    if (base64) {
                                      setEditCustomLogoUrl(base64);
                                      localStorage.setItem('showroom_custom_logo', base64);
                                      onUpdateShowroomInfo({ customLogoUrl: base64 });
                                      window.dispatchEvent(new Event('showroom_logo_updated'));
                                      setSaveSuccess(true);
                                      setTimeout(() => setSaveSuccess(false), 3000);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                                e.target.value = '';
                              }}
                            />
                          </label>

                          {/* Delete Logo Button */}
                          {editCustomLogoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditCustomLogoUrl('');
                                localStorage.removeItem('showroom_custom_logo');
                                onUpdateShowroomInfo({ customLogoUrl: '' });
                                window.dispatchEvent(new Event('showroom_logo_updated'));
                                setSaveSuccess(true);
                                setTimeout(() => setSaveSuccess(false), 3000);
                              }}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 text-rose-600" />
                              <span>{lang === 'ar' ? 'حذف الشعار' : 'Supprimer le logo'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address and Basic Contact */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      {lang === 'ar' ? 'العنوان وتفاصيل الاتصال الأساسية' : 'Adresse et Contact de base'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'العنوان باللغة العربية' : 'Adresse en Arabe'}
                        </label>
                        <textarea
                          rows={2}
                          value={editAddressAr}
                          onChange={(e) => setEditAddressAr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2 px-3 text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'العنوان باللغة الفرنسية' : 'Adresse en Français'}
                        </label>
                        <textarea
                          rows={2}
                          value={editAddressFr}
                          onChange={(e) => setEditAddressFr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2 px-3 text-xs text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'رقم الهاتف المباشر المعروض' : 'Téléphone direct Showroom'}
                        </label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'البريد الإلكتروني للمعرض' : 'E-mail de contact'}
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social accounts and Whatsapp */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      {lang === 'ar' ? 'حسابات التواصل الاجتماعي والواتساب' : 'Réseaux Sociaux et WhatsApp'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'رقم الواتساب المباشر' : 'Numéro WhatsApp'}
                        </label>
                        <input
                          type="text"
                          value={editWhatsApp}
                          onChange={(e) => setEditWhatsApp(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800 font-mono"
                          placeholder="+2126XXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'رابط صفحة الفيسبوك' : 'Lien Page Facebook'}
                        </label>
                        <input
                          type="text"
                          value={editFacebook}
                          onChange={(e) => setEditFacebook(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800 font-mono"
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {lang === 'ar' ? 'رابط حساب الانستغرام' : 'Lien Compte Instagram'}
                      </label>
                      <input
                        type="text"
                        value={editInstagram}
                        onChange={(e) => setEditInstagram(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800 font-mono"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>

                  {/* Site Interface texts */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      {lang === 'ar' ? 'تخصيص نصوص واجهة الموقع' : 'Textes de l\'interface du site'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'اسم المعرض (بالعربية)' : 'Nom du showroom (Arabe)'}
                        </label>
                        <input
                          type="text"
                          value={editBrandNameAr}
                          onChange={(e) => setEditBrandNameAr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'اسم المعرض (بالفرنسية)' : 'Nom du showroom (Français)'}
                        </label>
                        <input
                          type="text"
                          value={editBrandNameFr}
                          onChange={(e) => setEditBrandNameFr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'شعار الفوتر (بالعربية)' : 'Slogan Footer (Arabe)'}
                        </label>
                        <input
                          type="text"
                          value={editSloganAr}
                          onChange={(e) => setEditSloganAr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'شعار الفوتر (بالفرنسية)' : 'Slogan Footer (Français)'}
                        </label>
                        <input
                          type="text"
                          value={editSloganFr}
                          onChange={(e) => setEditSloganFr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'العنوان الرئيسي للواجهة (بالعربية)' : 'Titre principal Hero (Arabe)'}
                        </label>
                        <textarea
                          rows={2}
                          value={editHeroTitleAr}
                          onChange={(e) => setEditHeroTitleAr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2 px-3 text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'العنوان الرئيسي للواجهة (بالفرنسية)' : 'Titre principal Hero (Français)'}
                        </label>
                        <textarea
                          rows={2}
                          value={editHeroTitleFr}
                          onChange={(e) => setEditHeroTitleFr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2 px-3 text-xs text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'الوصف الفرعي للواجهة (بالعربية)' : 'Sous-titre Hero (Arabe)'}
                        </label>
                        <textarea
                          rows={3}
                          value={editHeroSubtitleAr}
                          onChange={(e) => setEditHeroSubtitleAr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2 px-3 text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'الوصف الفرعي للواجهة (بالفرنسية)' : 'Sous-titre Hero (Français)'}
                        </label>
                        <textarea
                          rows={3}
                          value={editHeroSubtitleFr}
                          onChange={(e) => setEditHeroSubtitleFr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2 px-3 text-xs text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      {lang === 'ar' ? 'ساعات العمل الرسمية' : 'Horaires d\'ouverture'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'ساعات العمل بالعربية' : 'Horaires en Arabe'}
                        </label>
                        <input
                          type="text"
                          value={editHoursAr}
                          onChange={(e) => setEditHoursAr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'ساعات العمل بالفرنسية' : 'Horaires en Français'}
                        </label>
                        <input
                          type="text"
                          value={editHoursFr}
                          onChange={(e) => setEditHoursFr(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Map parameters */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                      {lang === 'ar' ? 'إعدادات الخريطة وموقع GPS' : 'Paramètres Google Map et GPS'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'اسم الموقع على الخريطة' : 'Nom du lieu sur la carte'}
                        </label>
                        <input
                          type="text"
                          value={editMapTitle}
                          onChange={(e) => setEditMapTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          {lang === 'ar' ? 'تفاصيل الموقع / العنوان الفرعي' : 'Sous-titre explicatif'}
                        </label>
                        <input
                          type="text"
                          value={editMapDesc}
                          onChange={(e) => setEditMapDesc(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {lang === 'ar' ? 'رابط أو كود تضمين خريطة جوجل (Google Maps URL / Iframe)' : 'Lien ou Code d\'intégration Google Maps (URL / Iframe)'}
                      </label>
                      <textarea
                        rows={3}
                        value={editMapUrl}
                        onChange={(e) => setEditMapUrl(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs text-gray-800 font-mono"
                        placeholder={lang === 'ar' ? 'https://maps.google.com/... أو كود <iframe...' : 'https://maps.google.com/... ou code <iframe...'}
                      />
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        {lang === 'ar' 
                          ? 'يمكنك وضع رابط الخريطة العادي، أو كود التضمين (iframe) بالكامل المأخوذ من مشاركة الخريطة في جوجل ماب.'
                          : 'Vous pouvez coller un lien Google Maps standard ou le code d\'intégration complet (iframe) partagé depuis Google Maps.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onUpdateShowroomInfo({
                          addressAr: editAddressAr,
                          addressFr: editAddressFr,
                          phone: editPhone,
                          workHoursAr: editHoursAr,
                          workHoursFr: editHoursFr,
                          mapTitle: editMapTitle,
                          mapDesc: editMapDesc,
                          mapUrl: editMapUrl,
                          email: editEmail,
                          whatsapp: editWhatsApp,
                          facebook: editFacebook,
                          instagram: editInstagram,
                          brandNameAr: editBrandNameAr,
                          brandNameFr: editBrandNameFr,
                          heroTitleAr: editHeroTitleAr,
                          heroTitleFr: editHeroTitleFr,
                          heroSubtitleAr: editHeroSubtitleAr,
                          heroSubtitleFr: editHeroSubtitleFr,
                          sloganAr: editSloganAr,
                          sloganFr: editSloganFr,
                          customLogoUrl: editCustomLogoUrl,
                        });
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3000);
                      }}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-100 transition cursor-pointer text-xs"
                    >
                      {lang === 'ar' ? 'حفظ البيانات الجديدة للمعرض والواجهات' : 'Enregistrer toutes les modifications'}
                    </button>
                  </div>
                </div>

                {/* Live Preview representation */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-sm border border-slate-800/80">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-2">
                      {lang === 'ar' ? 'معاينة حية للتغيير' : 'Aperçu en temps réel'}
                    </span>
                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                      {lang === 'ar' ? 'هذا هو المظهر الفعلي لبيانات الاتصال على صفحة تواصل معنا:' : 'Voici comment s\'affichera l\'information sur la page de contact :'}
                    </p>

                    <div className="bg-white text-gray-600 rounded-xl p-4 space-y-3 shadow-inner border border-gray-100">
                      <div className="flex items-start gap-2 text-xs">
                        <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-gray-800 text-[11px]">{lang === 'ar' ? 'العنوان الرسمي للمعرض' : 'Adresse de l\'exposition'}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                            {lang === 'ar' ? editAddressAr : editAddressFr}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs border-t border-gray-100 pt-2">
                        <Phone className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-gray-800 text-[11px]">{lang === 'ar' ? 'رقم الهاتف المباشر' : 'Téléphone Showroom'}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 font-bold font-mono">{editPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs border-t border-gray-100 pt-2">
                        <Clock className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-gray-800 text-[11px]">{lang === 'ar' ? 'ساعات العمل الرسمية' : 'Heures d\'ouverture'}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {lang === 'ar' ? editHoursAr : editHoursFr}
                          </p>
                        </div>
                      </div>

                      {editEmail && (
                        <div className="flex items-start gap-2 text-xs border-t border-gray-100 pt-2">
                          <Mail className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-gray-800 text-[11px]">{lang === 'ar' ? 'البريد الإلكتروني' : 'Adresse E-mail'}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{editEmail}</p>
                          </div>
                        </div>
                      )}

                      {editWhatsApp && (
                        <div className="flex items-start gap-2 text-xs border-t border-gray-100 pt-2">
                          <MessageSquare className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-extrabold text-gray-800 text-[11px]">{lang === 'ar' ? 'رقم الواتساب' : 'WhatsApp'}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{editWhatsApp}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-slate-950 relative shadow-sm border border-slate-800 w-full h-[180px]">
                      {(() => {
                        const url = editMapUrl || '';
                        if (url.includes('<iframe')) {
                          const srcMatch = url.match(/src="([^"]+)"/);
                          if (srcMatch && srcMatch[1]) {
                            return (
                              <iframe
                                src={srcMatch[1]}
                                className="w-full h-full border-0"
                                allowFullScreen={true}
                                loading="lazy"
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
                              />
                            );
                          }
                          return (
                            <iframe
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(editMapTitle || 'Marrakech')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                              className="w-full h-full border-0"
                              allowFullScreen={true}
                              loading="lazy"
                            />
                          );
                        }
                        return (
                          <div className="absolute inset-0 bg-slate-900 opacity-80 flex flex-col items-center justify-center p-3 text-center text-white space-y-1">
                            <MapPin className="h-6 w-6 text-rose-500 animate-bounce" />
                            <p className="font-bold text-[11px]">{editMapTitle || 'Marrakech - Massira 2 Anbar'}</p>
                            <p className="text-[9px] text-gray-400">{editMapDesc || 'Sector 028154...'}</p>
                            <span className="bg-rose-500 text-white font-bold py-1 px-2.5 rounded-md text-[9px] uppercase cursor-default">
                              {lang === 'ar' ? 'افتح الخريطة' : 'Open Maps'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ADMIN ACCOUNT SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="space-y-6" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {lang === 'ar' ? 'إعدادات الأمان والحساب' : 'Sécurité & Identifiants'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === 'ar' 
                    ? 'قم بتحديث البريد الإلكتروني وكلمة المرور الخاصة بلوحة التحكم لضمان أمان حسابك.' 
                    : 'Modifiez l\'adresse e-mail et le mot de passe de la plate-forme d\'administration.'}
                </p>
              </div>

              {securityMessage && (
                <div className={`border p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
                  securityIsError 
                    ? 'bg-rose-50 border-rose-100 text-rose-700' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}>
                  {securityIsError ? <X className="h-4 w-4 text-rose-600 shrink-0" /> : <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                  <span>{securityMessage}</span>
                </div>
              )}

              <div className="max-w-2xl bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <form onSubmit={handleUpdateCredentials} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        {lang === 'ar' ? 'البريد الإلكتروني الجديد للوحة التحكم' : 'Nouvel e-mail administrateur'}
                      </label>
                      <input 
                        type="email" 
                        value={securityEmail}
                        onChange={(e) => setSecurityEmail(e.target.value)}
                        placeholder="adnane@auto.ma"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-3 px-4 text-sm text-gray-800 transition" 
                        required
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        {lang === 'ar' ? 'هذا البريد الإلكتروني سيُستخدم لتسجيل الدخول مستقبلاً.' : 'Cet e-mail sera requis lors de vos prochaines connexions.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          {lang === 'ar' ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}
                        </label>
                        <input 
                          type="password" 
                          value={securityPassword}
                          onChange={(e) => setSecurityPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-3 px-4 text-sm text-gray-800 transition" 
                          required
                          minLength={6}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          {lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirmer le mot de passe'}
                        </label>
                        <input 
                          type="password" 
                          value={securityPasswordConfirm}
                          onChange={(e) => setSecurityPasswordConfirm(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-3 px-4 text-sm text-gray-800 transition" 
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
                    <button 
                      type="submit"
                      disabled={securityLoading}
                      className="bg-gray-900 hover:bg-gray-800 text-white font-black py-3 px-6 rounded-xl text-xs tracking-wide transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {securityLoading ? (
                        <span>{lang === 'ar' ? 'جاري التحديث...' : 'Mise à jour...'}</span>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          <span>{lang === 'ar' ? 'حفظ وتحديث بيانات الأمان' : 'Mettre à jour les identifiants'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY INTRUSION & BANNED IPS */}
          {activeTab === 'intrusion_security' && (
            <div className="space-y-6" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-rose-500" />
                    <span>{lang === 'ar' ? 'نظام مراقبة الاختراق والأمان الفعال' : 'Système de Détection d\'Intrusions'}</span>
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === 'ar' 
                      ? 'مراقبة هجمات Brute-Force وحقن SQL والمسح العشوائي للموقع مع التحكم الكامل في حظر المخترقين.' 
                      : 'Surveillance des attaques Brute-force, injections SQL et scans malveillants avec blocage automatique ou manuel.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={fetchSecurityData}
                    disabled={securityTabLoading}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition text-gray-600 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 text-xs font-semibold bg-white"
                    title={lang === 'ar' ? 'تحديث البيانات' : 'Actualiser'}
                  >
                    <RefreshCw className={`h-4 w-4 ${securityTabLoading ? 'animate-spin' : ''}`} />
                    <span>{lang === 'ar' ? 'تحديث' : 'Actualiser'}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={handleClearIntrusionLogs}
                    className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition text-rose-700 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{lang === 'ar' ? 'مسح السجلات' : 'Effacer les journaux'}</span>
                  </button>
                </div>
              </div>

              {securityTabMessage && (
                <div className={`border p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
                  securityTabIsError 
                    ? 'bg-rose-50 border-rose-100 text-rose-700' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}>
                  {securityTabIsError ? <X className="h-4 w-4 text-rose-600 shrink-0" /> : <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                  <span>{securityTabMessage}</span>
                </div>
              )}

              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                  <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400">{lang === 'ar' ? 'إجمالي محاولات الاختراق' : 'Tentatives détectées'}</span>
                    <span className="block text-2xl font-black text-gray-900 mt-0.5">{intrusionLogs.length}</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                  <div className="bg-rose-50 p-3.5 rounded-2xl text-rose-600">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400">{lang === 'ar' ? 'تهديدات شديدة الخطورة' : 'Menaces critiques'}</span>
                    <span className="block text-2xl font-black text-gray-900 mt-0.5">
                      {intrusionLogs.filter(log => log.severity === 'Critical' || log.severity === 'High').length}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                  <div className="bg-gray-950 p-3.5 rounded-2xl text-white">
                    <Ban className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400">{lang === 'ar' ? 'الـ IPs المحظورة للأبد' : 'IPs bannies à vie'}</span>
                    <span className="block text-2xl font-black text-gray-900 mt-0.5">{bannedIPs.length}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MANUAL BAN & BANNED LIST */}
                <div className="lg:col-span-1 space-y-6">
                  {/* MANUAL BAN FORM */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Ban className="h-4 w-4 text-rose-500" />
                      <span>{lang === 'ar' ? 'حظر عنوان IP يدوياً' : 'Bannir une IP manuellement'}</span>
                    </h3>
                    <form onSubmit={handleManualBanIP} className="space-y-3">
                      <input 
                        type="text"
                        placeholder="e.g. 192.168.1.100"
                        value={manualBanIP}
                        onChange={(e) => setManualBanIP(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3.5 text-sm text-gray-800 transition"
                        required
                      />
                      <button 
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 border-0"
                      >
                        <Ban className="h-4 w-4" />
                        <span>{lang === 'ar' ? 'حظر هذا العنوان للأبد' : 'Bannir définitivement'}</span>
                      </button>
                    </form>
                  </div>

                  {/* BANNED IPS LIST */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-800" />
                        <span>{lang === 'ar' ? 'قائمة العناوين المحظورة للأبد' : 'IPs bloquées à vie'}</span>
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {bannedIPs.length}
                      </span>
                    </h3>

                    {bannedIPs.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-6">
                        {lang === 'ar' ? 'لا توجد عناوين محظورة حالياً' : 'Aucune IP bannie.'}
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {bannedIPs.map(ip => (
                          <div key={ip} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/50 transition">
                            <span className="font-mono text-xs text-gray-800 font-bold">{ip}</span>
                            <button 
                              type="button"
                              onClick={() => handleUnbanIP(ip)}
                              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-extrabold hover:underline bg-transparent border-0 cursor-pointer"
                            >
                              {lang === 'ar' ? 'إلغاء الحظر' : 'Débloquer'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* INTRUSION LOGS */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-500" />
                    <span>{lang === 'ar' ? 'سجل محاولات الاختراق المرصودة بالتفصيل' : 'Journal des intrusions détectées'}</span>
                  </h3>

                  {intrusionLogs.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full inline-block mb-3">
                        <Check className="h-8 w-8" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800">{lang === 'ar' ? 'موقعك آمن تماماً!' : 'Aucune menace détectée'}</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        {lang === 'ar' 
                          ? 'لم يتم تسجيل أي محاولات اختراق أو نشاط مشبوه على الخادم حتى الآن.' 
                          : 'Aucune tentative de piratage ou activité suspecte n\'a été détectée sur le serveur.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                      {intrusionLogs.map((log: any) => {
                        const isIPBanned = bannedIPs.includes(log.ip);
                        const severityColors = {
                          Low: 'bg-blue-50 text-blue-700 border-blue-100',
                          Medium: 'bg-amber-50 text-amber-700 border-amber-100',
                          High: 'bg-orange-50 text-orange-700 border-orange-100',
                          Critical: 'bg-rose-50 text-rose-700 border-rose-100'
                        };

                        return (
                          <div key={log.id} className="border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition bg-white space-y-3 shadow-sm text-right">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                                  {log.ip}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColors[log.severity as keyof typeof severityColors] || 'bg-gray-50'}`}>
                                  {log.severity}
                                </span>
                                {isIPBanned && (
                                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                                    {lang === 'ar' ? 'محظور للأبد ⛔' : 'Banni'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-left" style={{ direction: 'ltr' }}>
                              <div className="flex items-start gap-1">
                                <strong className="text-gray-700 shrink-0">{lang === 'ar' ? 'نوع الهجوم:' : 'Type:'}</strong>
                                <span className="text-gray-900 font-bold">{log.type}</span>
                              </div>
                              <div className="flex items-start gap-1">
                                <strong className="text-gray-700 shrink-0">{lang === 'ar' ? 'المسار المستهدف:' : 'Cible:'}</strong>
                                <span className="font-mono text-gray-600 break-all bg-gray-50 px-1 py-0.5 rounded border border-gray-100 text-[11px] font-bold">
                                  {log.method} {log.path}
                                </span>
                              </div>
                              <div className="flex items-start gap-1">
                                <strong className="text-gray-700 shrink-0">{lang === 'ar' ? 'التفاصيل:' : 'Détails:'}</strong>
                                <span className="text-rose-600 font-medium break-words bg-rose-50/30 px-2 py-1 rounded-xl block w-full">{log.description}</span>
                              </div>
                              <div className="text-[10px] text-gray-400 break-all pt-1 border-t border-gray-50">
                                <strong>User Agent:</strong> {log.userAgent}
                              </div>
                            </div>

                            {!isIPBanned && (
                              <div className="flex justify-end pt-1">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const token = localStorage.getItem('adnane_admin_token');
                                    fetch('/api/admin/security/ban', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ token, ipToBan: log.ip })
                                    }).then(res => {
                                      if (res.ok) {
                                        setSecurityTabIsError(false);
                                        setSecurityTabMessage(lang === 'ar' ? `تم حظر عنوان الـ IP: ${log.ip} للأبد بنجاح` : `IP ${log.ip} bannie définitivement`);
                                        fetchSecurityData();
                                      }
                                    });
                                  }}
                                  className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition cursor-pointer flex items-center gap-1"
                                >
                                  <Ban className="h-3 w-3" />
                                  <span>{lang === 'ar' ? 'حظر هذا المخترق للأبد' : 'Bloquer à vie'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: ADD / EDIT CAR */}
      {isCarModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative border border-gray-100" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            <button 
              onClick={() => setIsCarModalOpen(false)}
              className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-50`}
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6">
              {editingCar 
                ? (lang === 'ar' ? 'تعديل تفاصيل السيارة' : 'Modifier le véhicule') 
                : (lang === 'ar' ? 'إضافة سيارة جديدة للمخزون' : 'Ajouter un véhicule')}
            </h2>

            <form onSubmit={handleSaveCar} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'الماركة' : 'Marque'}</label>
                  <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'الموديل / الفئة' : 'Modèle'}</label>
                  <input type="text" value={model} onChange={e => setModel(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'السنة' : 'Année'}</label>
                  <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'السعر (DHS)' : 'Prix (DHS)'}</label>
                  <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'المسافة (كم)' : 'Kilométrage (km)'}</label>
                  <input type="number" value={km} onChange={e => setKm(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'اللون خارجي' : 'Couleur'}</label>
                  <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'الوقود' : 'Carburant'}</label>
                  <select value={fuel} onChange={e => setFuel(e.target.value as any)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800">
                    <option value="Diesel">Diesel</option>
                    <option value="Essence">Essence</option>
                    <option value="Hybride">Hybride</option>
                    <option value="Electrique">Electrique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'ناقل الحركة' : 'Transmission'}</label>
                  <select value={transmission} onChange={e => setTransmission(e.target.value as any)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800">
                    <option value="Automatique">Automatique</option>
                    <option value="Manuelle">Manuelle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'الهيكل' : 'Carrosserie'}</label>
                  <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800">
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'حالة السيارة' : 'État'}</label>
                  <select value={condition} onChange={e => setCondition(e.target.value as any)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800">
                    <option value="Excellent">Excellent</option>
                    <option value="Très bon">Très bon</option>
                    <option value="Bon">Bon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {lang === 'ar' ? 'صورة السيارة الرئيسية' : 'Photo principale du véhicule'}
                </label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
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
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setImageInput(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition duration-200 ${
                    isDragging 
                      ? 'border-rose-500 bg-rose-50/30' 
                      : 'border-gray-200/80 hover:bg-gray-50/50'
                  }`}
                >
                  <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-500 font-medium block">
                    {lang === 'ar' 
                      ? 'اسحب صورة السيارة هنا أو انقر لاختيار ملف من جهازك' 
                      : 'Glissez la photo de la voiture ici ou cliquez pour choisir un fichier'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {lang === 'ar' ? '(صيغ مدعومة: JPG, PNG, WEBP)' : '(Formats supportés : JPG, PNG, WEBP)'}
                  </span>
                </div>

                {imageInput && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      {lang === 'ar' ? 'معاينة الصورة:' : 'Aperçu de la photo :'}
                    </p>
                    <div className="relative w-40 aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 group">
                      <img 
                        src={imageInput} 
                        alt="Car Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageInput('');
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white p-1.5 rounded-full transition duration-150"
                        title={lang === 'ar' ? 'حذف' : 'Supprimer'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {lang === 'ar' ? 'فيديو السيارة (اختياري)' : 'Vidéo du véhicule (Optionnel)'}
                </label>
                <input 
                  type="file" 
                  ref={videoFileInputRef} 
                  onChange={handleVideoFileChange} 
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
                          setVideoInput(reader.result);
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
                  <Video className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-gray-500 font-medium block">
                    {lang === 'ar' 
                      ? 'اسحب فيديو السيارة هنا أو انقر لاختيار ملف من جهازك' 
                      : 'Glissez la vidéo de la voiture ici ou cliquez pour choisir un fichier'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {lang === 'ar' ? '(صيغ مدعومة: MP4, WebM, OGG)' : '(Formats supportés : MP4, WebM, OGG)'}
                  </span>
                </div>

                {videoInput && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      {lang === 'ar' ? 'معاينة الفيديو:' : 'Aperçu de la vidéo :'}
                    </p>
                    <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 group">
                      <video 
                        src={videoInput} 
                        controls
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoInput('');
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white p-1.5 rounded-full transition duration-150 z-10"
                        title={lang === 'ar' ? 'حذف' : 'Supprimer'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'الخيارات والمميزات (مفصولة بفاصلة)' : 'Options (séparées par une virgule)'}</label>
                <input type="text" value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'الوصف بالعربية' : 'Description en Arabe'}</label>
                <textarea value={descAr} onChange={e => setDescAr(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800 h-16" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{lang === 'ar' ? 'الوصف بالفرنسية' : 'Description en Français'}</label>
                <textarea value={descFr} onChange={e => setDescFr(e.target.value)} className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-sm text-gray-800 h-16" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCarModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-xl text-xs transition cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                </button>
                <button 
                  type="submit" 
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-rose-100"
                >
                  {lang === 'ar' ? 'حفظ التعديلات' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM DELETE CONFIRMATION */}
      {deleteCarId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            <h3 className="text-lg font-black text-gray-900 mb-2">
              {lang === 'ar' ? 'تأكيد الحذف' : 'Confirmer la suppression'}
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {lang === 'ar' 
                ? 'هل أنت متأكد من حذف هذه السيارة من المخزون نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' 
                : 'Êtes-vous sûr de vouloir supprimer définitivement ce véhicule du stock ? Cette action est irréversible.'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setDeleteCarId(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Annuler'}
              </button>
              <button 
                onClick={() => {
                  const updated = cars.filter(c => c.id !== deleteCarId);
                  onUpdateCars(updated);
                  setDeleteCarId(null);
                }}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition cursor-pointer shadow-lg shadow-rose-100"
              >
                {lang === 'ar' ? 'حذف السيارة' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL VIEW FOR SELL REQUEST (PHOTOS & VIDEOS & NOTES) */}
      {selectedSellRequest && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200"
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedSellRequest(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 p-2 rounded-full transition duration-150 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase ${
                  selectedSellRequest.requestType === 'Reprise'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {selectedSellRequest.requestType === 'Reprise' ? (lang === 'ar' ? '🔄 طلب استبدال (Reprise)' : '🔄 Service Reprise') : (lang === 'ar' ? '🏷️ بيع مباشر (Vente Cash)' : '🏷️ Vente Directe Cash')}
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                  selectedSellRequest.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                  selectedSellRequest.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {selectedSellRequest.status}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {selectedSellRequest.brand} {selectedSellRequest.model} ({selectedSellRequest.year})
              </h2>
              {selectedSellRequest.targetCarName && (
                <div className="mt-2 p-3 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">{lang === 'ar' ? 'السيارة المرغوب الاستبدال بها من المعرض:' : 'Véhicule du showroom ciblé :'}</span>
                  <span className="font-extrabold text-rose-400">{selectedSellRequest.targetCarName}</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {lang === 'ar' ? 'تاريخ تقديم الطلب:' : 'Reçu le :'} {selectedSellRequest.createdAt} • ID: #{selectedSellRequest.id}
              </p>
            </div>

            {/* Main Content Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Specifications, Contact and Status Updates */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                    {lang === 'ar' ? 'بيانات ومواصفات السيارة' : 'Spécifications du Véhicule'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'الماركة' : 'Marque'}</p>
                      <p className="text-xs font-bold text-gray-800">{selectedSellRequest.brand}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'الموديل' : 'Modèle'}</p>
                      <p className="text-xs font-bold text-gray-800">{selectedSellRequest.model}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'سنة الصنع' : 'Année'}</p>
                      <p className="text-xs font-bold text-gray-800">{selectedSellRequest.year}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'المسافة المقطوعة' : 'Kilométrage'}</p>
                      <p className="text-xs font-bold text-gray-800">{selectedSellRequest.km.toLocaleString()} KM</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'حالة الهيكل' : 'État de carrosserie'}</p>
                      <p className="text-xs font-bold text-gray-800">{selectedSellRequest.condition}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'السعر المقترح من العميل' : 'Prix demandé'}</p>
                      <p className="text-sm font-black text-rose-500">{selectedSellRequest.priceRequested.toLocaleString()} DHS</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                    {lang === 'ar' ? 'معلومات الاتصال بالعميل' : 'Informations du Client'}
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'رقم الهاتف' : 'Téléphone'}</p>
                        <a 
                          href={`tel:${selectedSellRequest.phone}`}
                          className="text-xs font-bold text-gray-800 hover:text-rose-500 transition"
                        >
                          {selectedSellRequest.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'المدينة' : 'Ville'}</p>
                        <p className="text-xs font-bold text-gray-800">{selectedSellRequest.city}</p>
                      </div>
                    </div>

                    {/* Quick WhatsApp / Call actions */}
                    <div className="flex gap-2 pt-1.5">
                      <a 
                        href={`https://wa.me/${selectedSellRequest.phone.replace(/[\s+]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-center py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{lang === 'ar' ? 'تواصل عبر واتساب' : 'WhatsApp'}</span>
                      </a>
                      <a 
                        href={`tel:${selectedSellRequest.phone}`}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-center py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{lang === 'ar' ? 'اتصال هاتفي' : 'Appeler'}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Internal Showroom Notes */}
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                    {lang === 'ar' ? 'ملاحظات المعرض والمتابعة (تلقائي الحفظ)' : 'Notes du showroom (Sauvegarde automatique)'}
                  </h3>
                  <textarea
                    rows={3}
                    value={staffNotes[selectedSellRequest.id] || ''}
                    onChange={(e) => handleSaveStaffNotes(selectedSellRequest.id, e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب ملاحظاتك عن هذا العميل أو تفاصيل الصفقة هنا...' : 'Saisissez vos remarques internes sur ce dossier ici...'}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-rose-500 outline-none rounded-2xl py-2.5 px-3.5 text-xs text-gray-800 leading-relaxed shadow-inner"
                  />
                </div>
              </div>

              {/* Right Column: Uploaded Pictures and Videos */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                    {lang === 'ar' ? 'صور السيارة المرفوعة من العميل' : 'Photos transmises par le client'}
                  </h3>
                  {selectedSellRequest.images && selectedSellRequest.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto p-1 bg-gray-50 rounded-2xl border border-gray-100">
                      {selectedSellRequest.images.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden shadow-sm border border-white group">
                          <img 
                            src={img} 
                            alt={`Car upload ${index + 1}`} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                          />
                          <a 
                            href={img} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white font-bold text-[10px] uppercase cursor-pointer"
                          >
                            {lang === 'ar' ? 'توسيع الصورة' : 'Agrandir'}
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-400">
                        {lang === 'ar' ? 'لم يقم العميل برفع أي صور.' : 'Aucune photo transmise par le client.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Uploaded Video */}
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                    {lang === 'ar' ? 'فيديو السيارة المرفوع من العميل' : 'Vidéo transmise par le client'}
                  </h3>
                  {selectedSellRequest.video ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-gray-200 bg-slate-950 shadow-sm relative">
                      <video 
                        src={selectedSellRequest.video} 
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-400">
                        {lang === 'ar' ? 'لم يقم العميل برفع أي فيديو للسيارة.' : 'Aucune vidéo transmise par le client.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Decisions & Status Updates inside details */}
                <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">
                      {lang === 'ar' ? 'تعديل حالة الطلب الحالية' : 'Modifier le statut du dossier'}
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      {lang === 'ar' ? 'يمكنك قبول أو رفض العرض مباشرة.' : 'Définissez la décision finale.'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateSellStatus(selectedSellRequest.id, 'Approved')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedSellRequest.status === 'Approved' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {lang === 'ar' ? 'قبول العرض' : 'Accepter'}
                    </button>
                    <button 
                      onClick={() => handleUpdateSellStatus(selectedSellRequest.id, 'Rejected')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedSellRequest.status === 'Rejected' 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      {lang === 'ar' ? 'رفض العرض' : 'Rejeter'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  handleDeleteSellRequest(selectedSellRequest.id);
                }}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>{lang === 'ar' ? 'حذف هذا الطلب نهائياً' : 'Supprimer définitivement'}</span>
              </button>

              <button 
                onClick={() => setSelectedSellRequest(null)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-xl text-xs transition cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق النافذة' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL VIEW FOR APPOINTMENT (NOTES & RE-SCHEDULE) */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
            style={{ direction: isRtl ? 'rtl' : 'ltr' }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-4 right-4 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 p-2 rounded-full transition duration-150 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-sky-50 text-sky-600 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase">
                  {lang === 'ar' ? 'حجز موعد زيارة' : 'Rendez-vous'}
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                  selectedAppointment.status === 'Scheduled' ? 'bg-sky-100 text-sky-700' :
                  selectedAppointment.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {selectedAppointment.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {lang === 'ar' ? 'موعد تجربة قيادة / زيارة المعرض' : 'Rendez-vous Visite / Essai'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                ID: #{selectedAppointment.id}
              </p>
            </div>

            {/* Content list */}
            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'العميل' : 'Client'}</p>
                    <p className="text-xs font-bold text-gray-800">{selectedAppointment.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'رقم الهاتف' : 'Téléphone'}</p>
                    <a href={`tel:${selectedAppointment.phone}`} className="text-xs font-bold text-rose-500 hover:underline">
                      {selectedAppointment.phone}
                    </a>
                  </div>
                </div>

                <hr className="border-gray-200/60" />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'السيارة المستهدفة' : 'Véhicule d\'intérêt'}</p>
                    <p className="text-xs font-bold text-gray-800">{selectedAppointment.carName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'التوقيت والميعاد' : 'Date & Heure'}</p>
                    <p className="text-xs font-bold text-gray-800">{selectedAppointment.date} @ {selectedAppointment.time}</p>
                  </div>
                </div>
              </div>

              {/* Direct Actions to Call / WhatsApp */}
              <div className="flex gap-2">
                <a 
                  href={`https://wa.me/${selectedAppointment.phone.replace(/[\s+]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'واتساب العميل' : 'WhatsApp Client'}</span>
                </a>
                <a 
                  href={`tel:${selectedAppointment.phone}`}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'اتصال مباشر' : 'Appeler direct'}</span>
                </a>
              </div>

              {/* Internal Notes */}
              <div>
                <h3 className="text-xs font-bold text-gray-600 mb-1.5">
                  {lang === 'ar' ? 'ملاحظات المعرض عن هذا الموعد:' : 'Remarques internes sur ce rendez-vous :'}
                </h3>
                <textarea
                  rows={3}
                  value={staffNotes[selectedAppointment.id] || ''}
                  onChange={(e) => handleSaveStaffNotes(selectedAppointment.id, e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب هنا ملاحظاتك (مثال: يرغب في تجربة القيادة، يود الشراء نقداً...)' : 'Ajoutez vos notes de suivi ici...'}
                  className="w-full bg-slate-50 border border-gray-200 focus:border-rose-500 outline-none rounded-2xl py-2.5 px-3.5 text-xs text-gray-800 leading-relaxed shadow-inner"
                />
              </div>

              {/* Modify appointment status */}
              <div className="bg-sky-50/40 border border-sky-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800">{lang === 'ar' ? 'تعديل حالة الموعد' : 'Modifier le statut'}</p>
                  <p className="text-[10px] text-gray-400">{lang === 'ar' ? 'تحديث مرحلة التواصل الحالية' : 'Mettre à jour l\'avancement'}</p>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, 'Completed')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition cursor-pointer ${
                      selectedAppointment.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    {lang === 'ar' ? 'اكتمل' : 'Complété'}
                  </button>
                  <button 
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, 'Cancelled')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition cursor-pointer ${
                      selectedAppointment.status === 'Cancelled' ? 'bg-rose-500 text-white' : 'bg-white text-rose-600 hover:bg-rose-50 border border-rose-200'
                    }`}
                  >
                    {lang === 'ar' ? 'إلغاء الموعد' : 'Annuler'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  handleDeleteAppointment(selectedAppointment.id);
                }}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>{lang === 'ar' ? 'حذف الموعد نهائياً' : 'Supprimer'}</span>
              </button>

              <button 
                onClick={() => setSelectedAppointment(null)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-xl text-xs transition cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
