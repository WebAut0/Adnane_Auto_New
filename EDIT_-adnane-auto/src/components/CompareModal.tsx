/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { X, ArrowRightLeft, Check, Sparkles } from 'lucide-react';
import { Car } from '../data/mockCars';

interface CompareModalProps {
  lang: 'ar' | 'fr';
  cars: Car[];
  onClose: () => void;
}

export default function CompareModal({ lang, cars, onClose }: CompareModalProps) {
  const [car1Id, setCar1Id] = useState<string>('');
  const [car2Id, setCar2Id] = useState<string>('');

  const car1 = cars.find(c => c.id === car1Id);
  const car2 = cars.find(c => c.id === car2Id);

  const isRtl = lang === 'ar';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-gray-100" 
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-50 cursor-pointer`}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-500">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {lang === 'ar' ? 'المقارنة الذكية بين السيارات' : 'Comparateur de Véhicules'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {lang === 'ar' ? 'قارن المواصفات التقنية والأسعار لسيارتين جنباً إلى جنب.' : 'Analysez deux véhicules simultanément pour faciliter votre choix.'}
            </p>
          </div>
        </div>

        {/* Selection panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              {lang === 'ar' ? 'اختر السيارة الأولى' : 'Premier véhicule'}
            </label>
            <select 
              value={car1Id} 
              onChange={e => setCar1Id(e.target.value)}
              className="w-full bg-white border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs sm:text-sm text-gray-800"
            >
              <option value="">-- {lang === 'ar' ? 'اختر سيارة' : 'Choisir'} --</option>
              {cars.map(c => (
                <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year}) - {c.price.toLocaleString()} DHS</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              {lang === 'ar' ? 'اختر السيارة الثانية' : 'Second véhicule'}
            </label>
            <select 
              value={car2Id} 
              onChange={e => setCar2Id(e.target.value)}
              className="w-full bg-white border border-gray-200 focus:border-rose-500 outline-none rounded-xl py-2.5 px-3 text-xs sm:text-sm text-gray-800"
            >
              <option value="">-- {lang === 'ar' ? 'اختر سيارة' : 'Choisir'} --</option>
              {cars.filter(c => c.id !== car1Id).map(c => (
                <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year}) - {c.price.toLocaleString()} DHS</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison grid / table */}
        {car1 && car2 ? (
          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-xs sm:text-sm text-left text-gray-700" style={{ textAlign: isRtl ? 'right' : 'left' }}>
              <tbody>
                {/* Images */}
                <tr className="bg-gray-50/50">
                  <td className="px-4 py-4 font-bold text-gray-500 min-w-[120px]">{lang === 'ar' ? 'السيارة' : 'Photo'}</td>
                  <td className="px-4 py-4 text-center">
                    <img src={car1.images[0]} alt="" className="h-24 w-36 object-cover rounded-xl border mx-auto" />
                    <p className="font-extrabold text-gray-900 mt-2">{car1.brand} {car1.model}</p>
                    <p className="text-xs text-rose-500 font-bold">{car1.year}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <img src={car2.images[0]} alt="" className="h-24 w-36 object-cover rounded-xl border mx-auto" />
                    <p className="font-extrabold text-gray-900 mt-2">{car2.brand} {car2.model}</p>
                    <p className="text-xs text-rose-500 font-bold">{car2.year}</p>
                  </td>
                </tr>

                {/* Price */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-bold text-gray-500">{lang === 'ar' ? 'السعر' : 'Prix'}</td>
                  <td className="px-4 py-3 text-center font-extrabold text-lg text-rose-500">{car1.price.toLocaleString()} DHS</td>
                  <td className="px-4 py-3 text-center font-extrabold text-lg text-rose-500">{car2.price.toLocaleString()} DHS</td>
                </tr>

                {/* Mileage */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-bold text-gray-500">{lang === 'ar' ? 'المسافة المقطوعة' : 'Kilométrage'}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">{car1.km.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">{car2.km.toLocaleString()} km</td>
                </tr>

                {/* Fuel */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-bold text-gray-500">{lang === 'ar' ? 'نوع الوقود' : 'Carburant'}</td>
                  <td className="px-4 py-3 text-center text-gray-800">{car1.fuel}</td>
                  <td className="px-4 py-3 text-center text-gray-800">{car2.fuel}</td>
                </tr>

                {/* Transmission */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-bold text-gray-500">{lang === 'ar' ? 'ناقل الحركة' : 'Transmission'}</td>
                  <td className="px-4 py-3 text-center text-gray-800">{car1.transmission}</td>
                  <td className="px-4 py-3 text-center text-gray-800">{car2.transmission}</td>
                </tr>

                {/* Condition */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-bold text-gray-500">{lang === 'ar' ? 'حالة السيارة' : 'État'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{car1.condition}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{car2.condition}</span>
                  </td>
                </tr>

                {/* Engine specs */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-bold text-gray-500">{lang === 'ar' ? 'محرك السيارة' : 'Moteur'}</td>
                  <td className="px-4 py-3 text-center text-gray-800">{car1.specs.engine}</td>
                  <td className="px-4 py-3 text-center text-gray-800">{car2.specs.engine}</td>
                </tr>

                {/* Fiscal power */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-bold text-gray-500">{lang === 'ar' ? 'القوة الجبائية' : 'Puissance fiscale'}</td>
                  <td className="px-4 py-3 text-center text-gray-800">{car1.specs.fiscalPower}</td>
                  <td className="px-4 py-3 text-center text-gray-800">{car2.specs.fiscalPower}</td>
                </tr>

                {/* Features (Compare count of features) */}
                <tr className="border-t">
                  <td className="px-4 py-3 font-bold text-gray-500">{lang === 'ar' ? 'خيارات مضافة' : 'Équipements'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
                      {car1.features.slice(0, 4).map((f, i) => (
                        <span key={i} className="bg-gray-100 text-[10px] px-2 py-0.5 rounded-md font-semibold text-gray-600">{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
                      {car2.features.slice(0, 4).map((f, i) => (
                        <span key={i} className="bg-gray-100 text-[10px] px-2 py-0.5 rounded-md font-semibold text-gray-600">{f}</span>
                      ))}
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed flex flex-col items-center justify-center space-y-3">
            <Sparkles className="h-10 w-10 text-rose-500 animate-pulse" />
            <h4 className="font-extrabold text-gray-800">
              {lang === 'ar' ? 'يرجى اختيار سيارتين للبدء بالتحليل' : 'Veuillez sélectionner deux voitures'}
            </h4>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              {lang === 'ar' ? 'سوف نظهر لك الفروقات الفنية، كفاءة استهلاك الوقود، ونسب التوفير لتسهيل عملية الشراء.' : 'Le système analysera instantanément les caractéristiques techniques pour vous.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
