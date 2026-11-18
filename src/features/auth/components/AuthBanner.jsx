import { useTranslation } from "react-i18next";
import { Navbar } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import Icon from '../../../shared/components/Icon';
import Logo from '../../../shared/components/Logo';

export default function AuthBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const features = [
    t("auth.mienPhiHoanToanKhongCanThe"),
    t("auth.truyCap200mBaiBaoKhoaHoc"),
    t("auth.theoDoiKeywordVaNhanThongBao"),
    t("auth.taoProjectVaQuanLyJournal")
  ];
  return (
    <div className="h-full w-full flex flex-col justify-between p-8 md:p-12 relative overflow-hidden bg-surface-muted text-foreground min-h-screen border-r border-border">
      {/* Animated ambient background glow spheres */}
      <div className="absolute" style={{
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 113, 188, 0.15) 0%, rgba(0, 113, 188, 0) 70%)',
        top: '-50px',
        right: '-50px',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        animation: 'banner-pulse-glow 8s ease-in-out infinite alternate'
      }} />
      <div className="absolute" style={{
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(7, 26, 28, 0.08) 0%, rgba(7, 26, 28, 0) 70%)',
        bottom: '80px',
        left: '-40px',
        filter: 'blur(35px)',
        pointerEvents: 'none',
        animation: 'banner-pulse-glow 10s ease-in-out infinite alternate-reverse'
      }} />

      {/* Grid Overlay with light line opacity */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(13, 27, 28, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(13, 27, 28, 0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        backgroundPosition: 'center',
        opacity: 0.85,
        zIndex: 1,
      }} />

      {/* Logo Brand */}
      <div className="flex items-center justify-between relative z-10">
        <div onClick={() => navigate("/")} className="cursor-pointer">
          <Logo size={42} fontSize="1rem" />
        </div>

        {/* Live Academic Pulse Tag */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/80 backdrop-blur shadow-xs text-xs">
          <span className="relative flex size-2">
            <span className="absolute size-full rounded-full bg-success opacity-75 animate-ping" />
            <span className="relative size-full rounded-full bg-success" />
          </span>
          <span className="font-semibold text-muted-foreground">200M+ Articles Tracked</span>
        </div>
      </div>

      {/* Main Banner Content */}
      <div className="my-auto relative z-10 max-w-[480px]">
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-subtle border border-primary/20">
          <Icon icon="lucide:sparkles" className="text-sm text-primary" />
          <span className="text-xs font-semibold text-primary">Academic Intelligence Platform</span>
        </div>

        <h1 className="font-display font-semibold text-base sm:text-lg text-foreground mb-3 leading-snug tracking-tight">
          {t("auth.thamGiaCongDongNghienCuu")}
        </h1>
        
        <p className="text-sm mb-5 text-muted-foreground leading-relaxed">
          {t("auth.cungHangNghinNhaNghienCuuSuDun")}
        </p>

        {/* Feature List */}
        <div className="flex flex-col gap-3 mb-4">
          {features.map((feat, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-surface/60">
              <div className="flex size-7 items-center justify-center shrink-0 rounded-full bg-primary-subtle border border-primary/30 text-primary shadow-xs">
                <Icon icon="lucide:check" className="text-xs" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Text and Icons */}
      <div className="flex items-center justify-between text-xs pt-3 border-t border-border text-muted-foreground relative z-10">
        <span>© {new Date().getFullYear()} Trending System. All rights reserved.</span>
        <div className="flex gap-3">
          <Icon icon="lucide:globe" width={16} className="cursor-pointer hover:text-foreground transition-colors" />
          <Icon icon="lucide:help-circle" width="16" className="cursor-pointer hover:text-foreground transition-colors" />
        </div>
      </div>

      <style>{`
        @keyframes banner-pulse-glow {
          0% { transform: scale(1) translate(0, 0); opacity: 0.7; }
          50% { transform: scale(1.15) translate(-10px, 15px); opacity: 1; }
          100% { transform: scale(0.95) translate(10px, -10px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
