import { activityIcon, resolveActivity } from "@/lib/activities";

export function ActivityArt({ activity, className = "wish-card-art" }: { activity: string; className?: string }) {
  const category = resolveActivity(activity)?.categoryKey;
  const park = ["walk_park", "walk_hike", "picnic", "hiking", "countryside", "dog_walk", "photo_walk"].includes(activity);
  const coffee = activity === "coffee" || activity === "brunch";
  const games = category === "boardgames";

  return (
    <svg viewBox="0 0 400 130" preserveAspectRatio="xMidYMid slice" className={className} fill="none" aria-hidden="true">
      <rect width="400" height="130" fill={park ? "#F7E6CE" : coffee ? "#F1DCCF" : "#EDE3F6"} />
      {park ? <ParkScene /> : coffee ? <CoffeeScene /> : games ? <GamesScene /> : (
        <>
          <circle cx="337" cy="22" r="64" fill="#E1D1EF" />
          <path d="M0 107C51 66 98 97 157 114C242 141 297 83 400 83V130H0Z" fill="#DBCAEB" />
          <circle cx="68" cy="27" r="28" fill="#FFDFC2" />
          <ellipse cx="200" cy="114" rx="53" ry="7" fill="#C6ACDF" />
          <rect x="160" y="18" width="80" height="88" rx="25" fill="#FFFAF2" transform="rotate(-6 200 62)" />
          <text x="200" y="81" textAnchor="middle" fontSize="53" fill="#6F48A7" fontFamily="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">{activityIcon(activity)}</text>
          <path d="M104 54V70M96 62H112M294 63V75M288 69H300" stroke="#A487C3" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 130V96C43 90 54 98 55 110C53 121 42 127 30 130M30 116C10 110 10 92 15 87C30 91 36 103 30 116" fill="#9EA58D" />
        </>
      )}
    </svg>
  );
}

function ParkScene() {
  return (
    <>
      <circle cx="308" cy="27" r="20" fill="#F0B676" />
      <path d="M123 54C156 33 169 62 191 47C221 24 231 39 252 47H123" fill="#FFF5E6" />
      <path d="M0 93C42 69 70 84 105 75C154 57 189 82 224 79C278 63 345 74 400 64V130H0" fill="#BAC6A0" />
      <path d="M0 107C85 87 134 101 182 98C254 87 328 98 400 87V130H0" fill="#93A881" />
      <path d="M151 130C153 108 183 91 226 82C204 98 198 116 208 130" fill="#F7CEAB" />
      <path d="M31 130L35 31M58 52L36 67M17 66L35 84M100 124L105 36M105 76L122 57" stroke="#7E755F" strokeWidth="5" strokeLinecap="round" />
      <path d="M4 58C-14 20 29-14 57 14C84 26 83 57 60 63C48 87 14 85 4 58" fill="#8EA987" />
      <path d="M17 24C26 0 56 5 64 24C73 46 49 63 30 54" fill="#ACC294" />
      <path d="M77 67C57 37 78 13 101 17C124-3 156 27 144 51C156 76 125 98 105 82C91 91 79 84 77 67" fill="#B1BC87" />
      <path d="M93 30C107 7 135 22 134 43C137 55 124 65 112 58" fill="#CCD1A0" />
      <path d="M354 127L348 62M326 83L348 98M348 86L365 76" stroke="#756D57" strokeWidth="4" strokeLinecap="round" />
      <path d="M328 82C310 62 325 40 343 40C355 19 385 35 381 55C398 70 382 94 366 89C350 102 333 96 328 82" fill="#97AB80" />
      <path d="M254 95H309M254 102H309M255 111H311" stroke="#B18069" strokeWidth="6" strokeLinecap="round" />
      <path d="M261 93V121M303 93V121" stroke="#766A75" strokeWidth="3" />
      <path d="M219 113V69M219 71L213 59H225L219 71M215 59V51H223V59" stroke="#837383" strokeWidth="2" fill="#FDECD1" />
      <path d="M9 123L15 116M69 119L76 112M326 124L333 117" stroke="#DCE1BA" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function CoffeeScene() {
  return (
    <>
      <rect x="250" y="-12" width="122" height="109" rx="20" fill="#CDBADF" />
      <path d="M313 0V85M250 37H372" stroke="#AE91C7" strokeWidth="5" />
      <circle cx="342" cy="18" r="18" fill="#FFE2B9" />
      <path d="M0 97C80 62 306 59 400 102V130H0Z" fill="#DDA77E" />
      <path d="M7 114C118 78 288 81 395 115M30 129C145 99 271 103 355 130" stroke="#C68F70" strokeWidth="2" />
      <ellipse cx="145" cy="105" rx="53" ry="10" fill="#F7D9B6" />
      <ellipse cx="258" cy="112" rx="49" ry="9" fill="#C78B69" />
      <path d="M174 63C205 55 204 94 174 92" stroke="#FFF5E2" strokeWidth="8" />
      <path d="M106 56H179L173 89C169 112 115 110 111 89Z" fill="#FFF7E7" />
      <ellipse cx="142" cy="57" rx="36" ry="11" fill="#EBC99D" />
      <ellipse cx="142" cy="58" rx="28" ry="7" fill="#AB7256" />
      <path d="M128 59C134 51 150 55 147 60C145 67 136 59 139 56" stroke="#FBE8C9" strokeWidth="2" strokeLinecap="round" />
      <path d="M286 71C316 64 315 101 286 101" stroke="#6B4995" strokeWidth="8" />
      <path d="M218 66H290L284 97C279 118 228 118 223 97Z" fill="#8157AE" />
      <ellipse cx="254" cy="67" rx="36" ry="11" fill="#A786CB" />
      <ellipse cx="254" cy="67" rx="28" ry="7" fill="#F4D9B1" />
      <path d="M240 68C244 61 261 64 262 68C260 74 244 64 246 63" stroke="#B98A65" strokeWidth="2" strokeLinecap="round" />
      <path d="M133 37C124 25 141 24 133 13M258 46C248 34 264 28 257 18" stroke="#FFF6E8" strokeWidth="3" strokeLinecap="round" />
      <path d="M25 100L18 77H53L47 102" fill="#A781B5" />
      <path d="M35 81L31 21M32 54C10 49 8 34 13 21C31 27 40 40 32 54M33 70C53 67 65 48 58 36C36 39 27 57 33 70" stroke="#859579" strokeWidth="3" fill="#95A386" />
      <path d="M366 94L360 64H391L385 100" fill="#F6DFC4" />
      <path d="M375 68V37M375 52C355 50 351 37 356 28C371 31 378 40 375 52M376 61C391 59 400 49 398 40C383 40 374 50 376 61" fill="#9DAD8D" />
    </>
  );
}

function GamesScene() {
  return (
    <>
      <circle cx="324" cy="15" r="62" fill="#E0D0EE" />
      <path d="M0 111C82 58 143 99 201 103C267 108 319 69 400 81V130H0Z" fill="#D7B9CE" />
      <ellipse cx="200" cy="114" rx="97" ry="8" fill="#B997C7" />
      <rect x="113" y="26" width="65" height="83" rx="10" fill="#FFF9EF" transform="rotate(-14 145 68)" />
      <path d="M136 55L159 63L136 82L126 65Z" fill="#E9A780" />
      <rect x="164" y="32" width="65" height="83" rx="10" fill="#8A61B6" transform="rotate(9 196 73)" />
      <path d="M193 53V83M178 68H208" stroke="#E5D5F4" strokeWidth="3" strokeLinecap="round" />
      <rect x="244" y="58" width="49" height="49" rx="10" fill="#F9D9B8" transform="rotate(13 268 82)" />
      <g fill="#92609C"><circle cx="259" cy="72" r="3" /><circle cx="278" cy="76" r="3" /><circle cx="269" cy="83" r="3" /><circle cx="257" cy="92" r="3" /><circle cx="276" cy="94" r="3" /></g>
      <path d="M71 40V54M64 47H78M316 75V89M309 82H323" stroke="#B495CA" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}
