import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, UserCheck, Send, Sparkles, Filter, CheckCircle2, ShieldCheck, Search, Pin, MessageCircleReply } from 'lucide-react';
import { Review } from '../data/mockCars';

interface VisitorReviewsSectionProps {
  lang: 'ar' | 'fr';
  reviews: Review[];
  onAddReview: (newReview: { name: string; city: string; rating: number; comment: string }) => void;
}

export const VisitorReviewsSection: React.FC<VisitorReviewsSectionProps> = ({
  lang,
  reviews,
  onAddReview,
}) => {
  const isRtl = lang === 'ar';

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState(isRtl ? 'مراكش' : 'Marrakech');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Filter and search states
  const [selectedFilterRating, setSelectedFilterRating] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  const citiesList = isRtl
    ? ['مراكش', 'الدار البيضاء', 'الرباط', 'طنجة', 'أكادير', 'فاس', 'مكناس', 'وجدة', 'القنيطرة', 'تطوان', 'مدينة أخرى']
    : ['Marrakech', 'Casablanca', 'Rabat', 'Tanger', 'Agadir', 'Fès', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Autre ville'];

  // Calculate statistics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fiveStarPct = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 100;

  const handleToggleLike = (id: string) => {
    setLikedReviews(prev => {
      const current = prev[id];
      const newStatus = !current;
      setLikeCounts(cPrev => ({
        ...cPrev,
        [id]: (cPrev[id] || 0) + (newStatus ? 1 : -1)
      }));
      return { ...prev, [id]: newStatus };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddReview({
        name: name.trim(),
        city: city || (isRtl ? 'مراكش' : 'Marrakech'),
        rating,
        comment: comment.trim()
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setName('');
      setComment('');
      setRating(5);

      setTimeout(() => {
        setSubmittedSuccess(false);
      }, 5000);
    }, 400);
  };

  // Filtered and sorted reviews list (pinned first)
  const filteredReviews = [...reviews]
    .filter(r => {
      const matchesRating = selectedFilterRating === 'all' || r.rating === selectedFilterRating;
      const textToSearch = `${r.name} ${r.city} ${r.commentAr || ''} ${r.commentFr || ''} ${r.replyAr || ''} ${r.replyFr || ''}`.toLowerCase();
      const matchesSearch = !searchQuery.trim() || textToSearch.includes(searchQuery.toLowerCase().trim());
      return matchesRating && matchesSearch;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  return (
    <section id="visitor-reviews" className="py-12 bg-slate-50/70 border-y border-gray-200/60" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* SECTION HEADER */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-rose-100/80 text-rose-700 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-rose-200/80">
            <MessageSquare className="h-3.5 w-3.5 text-rose-500" />
            <span>{isRtl ? 'آراء وانطباعات الزوار والعملاء' : 'Avis & Commentaires des Visiteurs'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
            {isRtl ? 'ماذا يقول زوار وعملاء معرض عدنان أوتو؟' : 'Ce que nos visiteurs et clients disent de nous'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
            {isRtl 
              ? 'نحرص دائماً على تقديم أفضل تجربة شراء واستبدال للسيارات في مراكش. شاركنا رأيك وانطباعك بكل شفافية.' 
              : 'Nous nous efforçons d\'offrir la meilleure expérience à nos clients. Laissez votre avis en toute transparence.'}
          </p>
        </div>

        {/* OVERALL STATS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center gap-4 p-3 bg-rose-50/50 rounded-2xl border border-rose-100/80">
            <div className="bg-rose-500 text-white p-3 rounded-2xl shadow-md shadow-rose-200 shrink-0">
              <Star className="h-7 w-7 fill-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">{avgRating}</span>
                <span className="text-xs font-bold text-gray-400">/ 5.0</span>
              </div>
              <div className="flex text-amber-400 gap-0.5 text-xs my-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[11px] font-bold text-gray-500">
                {isRtl ? `بناءً على ${totalReviews} تقييم زائر` : `Basé sur ${totalReviews} avis vérifiés`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/80">
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-md shadow-emerald-200 shrink-0">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-700">{fiveStarPct}%</span>
              <p className="text-xs font-extrabold text-gray-800 mt-0.5">
                {isRtl ? 'نسبة الرضا الكامل 5 نجوم' : 'Taux de satisfaction 5/5'}
              </p>
              <p className="text-[11px] text-gray-500">
                {isRtl ? 'خدمة شفافة وجودة مضمونة' : 'Service transparent et garanti'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-900 text-white rounded-2xl shadow-sm">
            <div className="bg-slate-800 text-rose-400 p-3 rounded-2xl shrink-0 border border-slate-700">
              <UserCheck className="h-7 w-7" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">{totalReviews}</span>
              <p className="text-xs font-extrabold text-gray-200 mt-0.5">
                {isRtl ? 'تعليق ومراجعة مسجلة' : 'Commentaires enregistrés'}
              </p>
              <p className="text-[11px] text-rose-400 font-bold">
                {isRtl ? 'مرحب بجميع الآراء' : 'Vos retours sont précieux'}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT: FORM ON LEFT (OR RIGHT IN RTL) & REVIEWS LIST ON OTHER SIDE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ADD COMMENT FORM CARD */}
          <div className="lg:col-span-5 bg-white border border-gray-200/80 shadow-xl rounded-3xl p-5 sm:p-7 space-y-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900">
                    {isRtl ? 'أضف تعليقك وتقييمك كزائر' : 'Laissez votre commentaire'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {isRtl ? 'ينشر تعليقك فوراً في الصفحة' : 'Votre avis sera publié instantanément'}
                  </p>
                </div>
              </div>
            </div>

            {submittedSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-extrabold">{isRtl ? 'تم نشر تعليقك بنجاح!' : 'Commentaire publié avec succès !'}</p>
                  <p className="text-emerald-700">{isRtl ? 'نشكرك جزيل الشكر على مشاركة انطباعك القيم معنا.' : 'Merci d\'avoir partagé votre expérience avec Adnane Auto.'}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* STAR RATING PICKER */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {isRtl ? 'درجة التقييم (اختر عدد النجوم):' : 'Votre note (sélectionnez les étoiles) :'}
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
                  <div className="flex items-center justify-between sm:justify-start gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${
                            (hoverRating || rating) >= star
                              ? 'fill-amber-400 text-amber-400 filter drop-shadow-sm'
                              : 'text-gray-300 fill-gray-100'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-200/80 whitespace-nowrap self-start sm:self-auto shadow-xs">
                    <span>{rating} / 5</span>
                    <span>•</span>
                    <span>
                      {rating === 5 ? (isRtl ? 'ممتاز جداً ⭐' : 'Excellent') : rating === 4 ? (isRtl ? 'جيد جداً 👍' : 'Très bien') : (isRtl ? 'مقبول' : 'Moyen')}
                    </span>
                  </div>
                </div>
              </div>

              {/* NAME FIELD */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRtl ? 'الاسم واللقب:' : 'Nom et Prénom :'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={isRtl ? 'مثال: عبد الرحيم المراكشي' : 'Ex: Abderrahim Marrakech'}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white outline-none rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-gray-900 font-semibold transition"
                  required
                />
              </div>

              {/* CITY FIELD */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isRtl ? 'المدينة:' : 'Ville :'}
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white outline-none rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-gray-900 font-semibold transition"
                >
                  {citiesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* COMMENT TEXT AREA */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    {isRtl ? 'التعليق والتجربة:' : 'Votre commentaire / Expérience :'}
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">{comment.length} / 500</span>
                </div>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  maxLength={500}
                  placeholder={isRtl ? 'اكتب رأيك بصراحة حول التعامل، النظافة، الاستقبال، أوتعقيبك بعد زيارة المعرض...' : 'Partagez votre avis sur l\'accueil, la qualité des véhicules, le service...'}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white outline-none rounded-2xl p-3 text-xs sm:text-sm text-gray-900 transition leading-relaxed"
                  required
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !comment.trim()}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-2xl shadow-lg shadow-rose-200 transition cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">{isRtl ? 'جاري النشر...' : 'Publication...'}</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{isRtl ? 'نشر التعليق والتقييم' : 'Publier mon commentaire'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* REVIEWS DISPLAY LIST & FILTERS */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* FILTER & SEARCH CONTROL BAR */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className={`h-4 w-4 text-gray-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? 'بحث في التعليقات...' : 'Rechercher dans les avis...'}
                  className={`w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white outline-none rounded-xl py-2.5 text-xs font-semibold text-gray-800 transition ${
                    isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                  }`}
                />
              </div>

              {/* Star rating filter pill buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedFilterRating('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition ${
                    selectedFilterRating === 'all'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isRtl ? 'الكل' : 'Tous'} ({totalReviews})
                </button>
                <button
                  onClick={() => setSelectedFilterRating(5)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap flex items-center gap-1 transition ${
                    selectedFilterRating === 5
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>5</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </button>
                <button
                  onClick={() => setSelectedFilterRating(4)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap flex items-center gap-1 transition ${
                    selectedFilterRating === 4
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>4</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </button>
              </div>
            </div>

            {/* LIST OF VISITOR COMMENT CARDS */}
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-200/80 space-y-3">
                <MessageSquare className="h-10 w-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-600">
                  {isRtl ? 'لا توجد تعليقات تطابق البحث المترشح' : 'Aucun commentaire ne correspond à votre recherche'}
                </p>
                <button
                  onClick={() => { setSelectedFilterRating('all'); setSearchQuery(''); }}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  {isRtl ? 'عرض كل التعليقات' : 'Réinitialiser les filtres'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((rev) => {
                  const isLiked = !!likedReviews[rev.id];
                  const extraLikes = likeCounts[rev.id] || 0;
                  const totalLikes = 3 + (rev.id.charCodeAt(0) % 5) + extraLikes;

                  return (
                    <div
                      key={rev.id}
                      className="bg-white border border-gray-200/80 hover:border-rose-200 shadow-sm hover:shadow-md rounded-2xl p-5 sm:p-6 transition duration-200 space-y-3"
                    >
                      {/* TOP ROW: AUTHOR AVATAR, NAME, CITY, BADGE & PINNED */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full font-extrabold text-base flex items-center justify-center border-2 shrink-0 shadow-xs select-none ${
                            (rev.name ? rev.name.charCodeAt(0) : 0) % 4 === 0 
                              ? 'bg-rose-500 text-white border-rose-100'
                              : (rev.name ? rev.name.charCodeAt(0) : 0) % 4 === 1
                              ? 'bg-indigo-600 text-white border-indigo-100'
                              : (rev.name ? rev.name.charCodeAt(0) : 0) % 4 === 2
                              ? 'bg-emerald-600 text-white border-emerald-100'
                              : 'bg-slate-800 text-white border-slate-200'
                          }`}>
                            {rev.name ? rev.name.trim().charAt(0) : 'ز'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-sm text-gray-900">{rev.name}</h4>
                              {rev.isVerifiedCustomer !== false && (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                  {isRtl ? 'عميل موثق' : 'Client Vérifié'}
                                </span>
                              )}
                              {rev.isPinned && (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                                  <Pin className="h-3 w-3 text-amber-600 fill-amber-500" />
                                  {isRtl ? 'مثبّت بالقمة' : 'Épinglé'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium">📍 {rev.city}</p>
                          </div>
                        </div>

                        {/* STAR RATING */}
                        <div className="flex text-amber-400 gap-0.5 shrink-0 bg-amber-50 px-2 py-1 rounded-xl border border-amber-100">
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

                      {/* COMMENT CONTENT */}
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal whitespace-pre-line bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        "{isRtl ? (rev.commentAr || rev.commentFr) : (rev.commentFr || rev.commentAr)}"
                      </p>

                      {/* OFFICIAL SHOWROOM REPLY IF PRESENT OR 5-STAR */}
                      {(rev.replyAr || rev.replyFr || rev.rating === 5) && (
                        <div className="bg-slate-900 text-white rounded-xl p-3.5 text-xs space-y-1.5 border border-slate-800 shadow-xs">
                          <div className="flex items-center justify-between text-rose-400 font-extrabold text-[11px]">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                              <span>{isRtl ? 'رد إدارة معرض عدنان أوتو:' : 'Réponse de Adnane Auto :'}</span>
                            </div>
                            {rev.repliedAt && (
                              <span className="text-[10px] text-slate-400 font-normal">{rev.repliedAt}</span>
                            )}
                          </div>
                          <p className="text-gray-300 text-[11px] sm:text-xs leading-relaxed font-medium">
                            {isRtl 
                              ? (rev.replyAr || 'نشكرك جزيل الشكر أخانا الكريم على ثقتك الغالية في معرضنا بمراكش، ويسعدنا دائماً تقديم أفضل خدمة لكم!')
                              : (rev.replyFr || 'Merci infiniment pour votre confiance ! Nous sommes ravis de vous avoir servi au showroom.')}
                          </p>
                        </div>
                      )}

                      {/* BOTTOM BAR: LIKE BUTTON */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-400">
                        <span className="text-[10px]">
                          {isRtl ? 'نُشر عبر المعرض الإلكتروني' : 'Publié sur le site web'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleLike(rev.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                            isLiked
                              ? 'bg-rose-100 text-rose-600 border border-rose-200'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{isRtl ? 'مفيد' : 'Utile'} ({totalLikes})</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
