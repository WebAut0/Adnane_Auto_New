/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Smartphone, CheckCircle, RefreshCw, X, MessageSquare } from 'lucide-react';

interface PhoneVerifyModalProps {
  lang: 'ar' | 'fr';
  phone: string;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function PhoneVerifyModal({
  lang,
  phone,
  isOpen,
  onClose,
  onVerified
}: PhoneVerifyModalProps) {
  const [otpCode, setOtpCode] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showSimulatedSms, setShowSimulatedSms] = useState<boolean>(true);
  const [resendTimer, setResendTimer] = useState<number>(30);

  const inputRef = useRef<HTMLInputElement>(null);

  // Generate OTP whenever modal opens with a new phone number
  useEffect(() => {
    if (isOpen) {
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newOtp);
      setOtpCode('');
      setError('');
      setIsSuccess(false);
      setShowSimulatedSms(true);
      setResendTimer(30);

      // Focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, phone]);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, resendTimer]);

  if (!isOpen) return null;

  const isRtl = lang === 'ar';

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.trim() !== generatedOtp) {
      setError(isRtl ? 'رمز التحقق غير صحيح. يرجى التأكد من الرمز المرسل.' : 'Code OTP incorrect. Veuillez vérifier le code reçu.');
      return;
    }

    setError('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1200);
    }, 600);
  };

  const handleResend = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setOtpCode('');
    setError('');
    setResendTimer(30);
    setShowSimulatedSms(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Simulated Floating SMS Notification Banner */}
      {showSimulatedSms && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 max-w-md w-[90%] bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 z-50 animate-in slide-in-from-top duration-300 flex items-start gap-3">
          <div className="bg-rose-500 p-2.5 rounded-xl shrink-0">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">SMS • Adnane Auto</span>
              <span className="text-[10px] text-gray-400">{isRtl ? 'الآن' : 'Maintenant'}</span>
            </div>
            <p className="text-xs font-semibold text-gray-200 mt-0.5">
              {isRtl ? `رمز توثيق رقم الهاتف ${phone} هو:` : `Votre code de vérification pour ${phone} est :`}
              <span className="bg-rose-500/20 text-rose-300 font-mono font-extrabold px-2 py-0.5 rounded ml-1 text-sm border border-rose-500/30">
                {generatedOtp}
              </span>
            </p>
          </div>
          <button 
            onClick={() => setShowSimulatedSms(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Dialog Modal */}
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-auto animate-in zoom-in-95 duration-200"
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 p-2 rounded-full transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900">
              {isRtl ? 'تم التوثيق بنجاح!' : 'Téléphone vérifié !'}
            </h3>
            <p className="text-xs text-emerald-600 font-bold bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-100 inline-block">
              {isRtl ? `تم تأكيد ملكية الرقم: ${phone}` : `Le numéro ${phone} appartient bien au client.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                {isRtl ? 'التحقق من ملكية رقم الهاتف' : 'Vérification du numéro'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isRtl 
                  ? `أرسلنا كود توثيق مكون من 4 أرقام عبر SMS إلى الرقم ` 
                  : `Un code OTP à 4 chiffres a été envoyé par SMS au `}
                <span className="font-bold text-gray-900 font-mono underline">{phone}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {isRtl ? 'أدخل رمز OTP المتكون من 4 أرقام' : 'Code de vérification (4 chiffres)'}
                </label>
                
                <input 
                  ref={inputRef}
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setOtpCode(val);
                    setError('');
                  }}
                  placeholder="• • • •"
                  className="w-full text-center text-2xl font-black font-mono tracking-[0.5em] bg-gray-50 border-2 border-gray-200 focus:border-rose-500 focus:bg-white outline-none rounded-2xl py-3 text-rose-600 transition"
                  required
                />

                {error && (
                  <p className="text-xs font-bold text-rose-500 text-center mt-2 bg-rose-50 p-2 rounded-xl border border-rose-100">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={otpCode.length !== 4 || isVerifying}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-rose-200 transition duration-150 cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>{isRtl ? 'تأكيد الرمز والتثبت' : 'Confirmer le code'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                {isRtl ? 'لم يصلك الكود؟' : 'Pas reçu de code ?'}
              </span>
              {resendTimer > 0 ? (
                <span className="font-mono text-gray-400 font-semibold">
                  {isRtl ? `إعادة الإرسال بعد ${resendTimer} ثانية` : `Renvoyer dans ${resendTimer}s`}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{isRtl ? 'إعادة إرسال رمز جديد' : 'Renvoyer le code'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
