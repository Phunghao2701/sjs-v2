const AuthLogo = () => {
  return (
    <div className="d-flex align-items-center justify-content-center mb-4">
      <img src="/Cyan_folded-ribbon_T_favicon.png" alt="" width="38" height="38" className="me-2" />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--primary)',
          letterSpacing: '-0.5px',
        }}
      >
        Trending System
      </span>
    </div>
  );
};

export default AuthLogo;
