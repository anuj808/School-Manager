const Owly = ({ size = 300 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 680 520" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        @keyframes float { 
          0%,100%{transform:translateY(0)} 
          50%{transform:translateY(-10px)} 
        }
        @keyframes blink { 
          0%,88%,100%{transform:scaleY(1)} 
          93%{transform:scaleY(0.05)} 
        }
        @keyframes pulse { 
          0%,100%{opacity:1} 
          50%{opacity:0.3} 
        }
        @keyframes wingL { 
          0%,100%{transform:rotate(0deg)} 
          50%{transform:rotate(-12deg)} 
        }
        @keyframes wingR { 
          0%,100%{transform:rotate(0deg)} 
          50%{transform:rotate(12deg)} 
        }
        .owl-float { 
          animation: float 3.5s ease-in-out infinite; 
          transform-origin: 340px 300px; 
        }
        .owl-eyeL { 
          animation: blink 5s ease-in-out infinite; 
          transform-origin: 310px 260px; 
        }
        .owl-eyeR { 
          animation: blink 5s ease-in-out infinite 0.15s; 
          transform-origin: 370px 260px; 
        }
        .owl-wL { 
          animation: wingL 3.5s ease-in-out infinite; 
          transform-origin: 255px 310px; 
        }
        .owl-wR { 
          animation: wingR 3.5s ease-in-out infinite; 
          transform-origin: 425px 310px; 
        }
        .owl-pulse { animation: pulse 2s ease-in-out infinite; }
        .owl-pulse2 { animation: pulse 2.8s ease-in-out infinite; }
        .owl-pulse3 { animation: pulse 3.4s ease-in-out infinite 0.5s; }
      `}</style>

      <g className="owl-float">
        {/* LEFT WING */}
        <g className="owl-wL">
          <ellipse cx="232" cy="320" rx="52" ry="90" fill="#7C3AED" transform="rotate(-18 232 320)"/>
          <ellipse cx="228" cy="318" rx="38" ry="72" fill="#8B5CF6" transform="rotate(-18 228 318)"/>
          <line x1="218" y1="285" x2="200" y2="355" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="230" y1="282" x2="214" y2="358" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="242" y1="284" x2="228" y2="356" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </g>

        {/* RIGHT WING */}
        <g className="owl-wR">
          <ellipse cx="448" cy="320" rx="52" ry="90" fill="#7C3AED" transform="rotate(18 448 320)"/>
          <ellipse cx="452" cy="318" rx="38" ry="72" fill="#8B5CF6" transform="rotate(18 452 318)"/>
          <line x1="438" y1="285" x2="456" y2="355" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="450" y1="282" x2="466" y2="358" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="462" y1="284" x2="476" y2="356" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </g>

        {/* BODY */}
        <ellipse cx="340" cy="340" rx="105" ry="118" fill="#7C3AED"/>
        <ellipse cx="340" cy="348" rx="85" ry="96" fill="#8B5CF6"/>
        <ellipse cx="340" cy="360" rx="58" ry="72" fill="#EDE9FE"/>
        <ellipse cx="340" cy="320" rx="28" ry="18" fill="#DDD6FE" opacity="0.7"/>
        <ellipse cx="315" cy="348" rx="22" ry="14" fill="#DDD6FE" opacity="0.5"/>
        <ellipse cx="365" cy="348" rx="22" ry="14" fill="#DDD6FE" opacity="0.5"/>
        <ellipse cx="340" cy="372" rx="25" ry="16" fill="#DDD6FE" opacity="0.5"/>
        <ellipse cx="318" cy="395" rx="18" ry="12" fill="#DDD6FE" opacity="0.4"/>
        <ellipse cx="362" cy="395" rx="18" ry="12" fill="#DDD6FE" opacity="0.4"/>

        {/* HEAD */}
        <ellipse cx="340" cy="240" rx="95" ry="88" fill="#7C3AED"/>
        <ellipse cx="340" cy="244" rx="82" ry="76" fill="#8B5CF6"/>

        {/* EAR TUFTS */}
        <polygon points="290,168 278,140 306,158" fill="#6D28D9"/>
        <polygon points="390,168 402,140 374,158" fill="#6D28D9"/>
        <polygon points="290,168 278,144 302,162" fill="#A78BFA"/>
        <polygon points="390,168 402,144 378,162" fill="#A78BFA"/>

        {/* GRADUATION CAP */}
        <rect x="272" y="172" width="136" height="16" rx="5" fill="#1E1B4B"/>
        <polygon points="340,144 272,182 408,182" fill="#1E1B4B"/>
        <line x1="408" y1="178" x2="420" y2="178" stroke="#FBBF24" strokeWidth="2.5"/>
        <line x1="420" y1="178" x2="420" y2="208" stroke="#FBBF24" strokeWidth="2.5"/>
        <rect x="413" y="208" width="14" height="18" rx="3" fill="#FBBF24"/>
        <line x1="415" y1="226" x2="412" y2="238" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="420" y1="226" x2="420" y2="240" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="425" y1="226" x2="428" y2="238" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round"/>

        {/* EYES */}
        <circle cx="310" cy="254" r="32" fill="#EDE9FE"/>
        <circle cx="370" cy="254" r="32" fill="#EDE9FE"/>
        <circle cx="310" cy="254" r="27" fill="#C4B5FD"/>
        <circle cx="370" cy="254" r="27" fill="#C4B5FD"/>
        <g className="owl-eyeL">
          <circle cx="310" cy="254" r="20" fill="#1E1B4B"/>
          <circle cx="310" cy="254" r="13" fill="#FBBF24"/>
          <circle cx="310" cy="254" r="7" fill="#1E1B4B"/>
          <circle cx="315" cy="248" r="4" fill="white"/>
        </g>
        <g className="owl-eyeR">
          <circle cx="370" cy="254" r="20" fill="#1E1B4B"/>
          <circle cx="370" cy="254" r="13" fill="#FBBF24"/>
          <circle cx="370" cy="254" r="7" fill="#1E1B4B"/>
          <circle cx="375" cy="248" r="4" fill="white"/>
        </g>

        {/* EYEBROWS */}
        <path d="M292 228 Q310 220 328 226" stroke="#6D28D9" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M352 226 Q370 220 388 228" stroke="#6D28D9" strokeWidth="3.5" fill="none" strokeLinecap="round"/>

        {/* BEAK */}
        <polygon points="340,278 325,296 355,296" fill="#F59E0B"/>
        <polygon points="340,278 325,287 355,287" fill="#FBBF24"/>

        {/* BOOK */}
        <g transform="rotate(-15 240 390)">
          <rect x="192" y="368" width="72" height="52" rx="4" fill="#EF4444"/>
          <rect x="196" y="372" width="64" height="44" rx="3" fill="#FCA5A5"/>
          <rect x="230" y="368" width="4" height="52" fill="#DC2626"/>
          <line x1="202" y1="382" x2="226" y2="382" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="202" y1="390" x2="226" y2="390" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <line x1="202" y1="398" x2="226" y2="398" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <text x="248" y="399" textAnchor="middle" fontFamily="Arial" fontSize="11" fontWeight="700" fill="#7C3AED">ERP</text>
        </g>

        {/* FEET */}
        <ellipse cx="306" cy="452" rx="18" ry="10" fill="#F59E0B"/>
        <line x1="294" y1="456" x2="286" y2="468" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
        <line x1="302" y1="458" x2="298" y2="472" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
        <line x1="310" y1="458" x2="310" y2="473" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
        <line x1="318" y1="456" x2="324" y2="468" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx="374" cy="452" rx="18" ry="10" fill="#F59E0B"/>
        <line x1="362" y1="456" x2="356" y2="468" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
        <line x1="370" y1="458" x2="366" y2="472" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
        <line x1="378" y1="458" x2="378" y2="473" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
        <line x1="386" y1="456" x2="392" y2="468" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
      </g>

      {/* SHADOW */}
      <ellipse cx="340" cy="485" rx="95" ry="12" fill="rgba(0,0,0,0.15)"/>

      {/* SPARKLES */}
      <circle cx="175" cy="210" r="7" fill="#FBBF24" opacity="0.8" className="owl-pulse"/>
      <circle cx="158" cy="300" r="4" fill="#34D399" opacity="0.7" className="owl-pulse2"/>
      <circle cx="505" cy="195" r="6" fill="#60A5FA" opacity="0.8" className="owl-pulse2"/>
      <circle cx="522" cy="305" r="4" fill="#A78BFA" opacity="0.7" className="owl-pulse"/>
    </svg>
  )
}

export default Owly
