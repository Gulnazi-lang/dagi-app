export function BrandLogo({ large = false }: { large?: boolean }) {
  return (
    <span className={`brand-logo ${large ? "brand-logo-large" : ""}`} aria-label="DUD.lv">
      DUD<span>.lv</span>
    </span>
  );
}

// Decorative vector art, not user avatars or community statistics.
export function FriendsArt({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 180" fill="none" aria-hidden="true">
      <path d="M8 136C-6 89 22 65 58 73C61 33 111 21 142 45C176 13 224 33 225 68C274 61 309 110 285 151Z" fill="#FBE1C8" />
      <circle cx="249" cy="42" r="22" fill="#F4B57D" />
      <path d="M218 134V89H227V74H236V50H238V74H247V89H253V134M262 135V106H275V84H277V106H290V135" fill="#CBB9E4" />
      <path d="M2 159C62 133 121 148 177 151C226 154 264 136 298 145V180H2Z" fill="#E0D2F0" />
      <path d="M36 152L31 92M32 126C14 122 9 112 11 100C28 101 34 111 32 126M32 114C46 111 52 101 49 91C34 94 28 102 32 114" stroke="#7D937D" strokeWidth="4" strokeLinecap="round" fill="#ABB89B" />
      <ellipse cx="148" cy="165" rx="94" ry="8" fill="#BCA5D8" opacity=".45" />
      <path d="M72 94C48 85 51 45 76 42C101 35 112 72 97 96Z" fill="#47284F" />
      <path d="M67 111L62 158H76L85 115M88 112L91 160H105L104 109" fill="#624487" />
      <path d="M63 90C67 79 92 79 101 88L111 124L90 133L59 122Z" fill="#EF9F74" />
      <path d="M66 93L53 127L76 137M99 94L113 111L124 104" stroke="#F5B287" strokeWidth="12" strokeLinecap="round" />
      <path d="M74 72V88L88 89V73" fill="#D98165" />
      <path d="M73 50C83 44 93 51 93 65C93 79 80 83 73 72Z" fill="#F5B287" />
      <path d="M67 57C70 45 88 43 95 56C85 55 83 51 81 48C82 56 75 60 68 64Z" fill="#47284F" />
      <path d="M82 71C85 73 88 71 89 69" stroke="#874953" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M61 156H78V165H56C54 161 59 158 61 156M90 158H105L112 165H90Z" fill="#352146" />
      <path d="M125 111L122 158H136L147 113L155 159H169L161 108" fill="#433056" />
      <path d="M129 81C143 75 157 78 164 86L170 125L119 125Z" fill="#8B63BC" />
      <path d="M130 88L114 117L99 113M159 87L177 116L190 108" stroke="#9C78CD" strokeWidth="13" strokeLinecap="round" />
      <path d="M142 67V83L153 85V68" fill="#BC7D61" />
      <path d="M132 44C144 33 161 44 157 62L158 69C153 79 139 76 135 64Z" fill="#D49B78" />
      <path d="M130 50C125 33 145 27 157 37L163 47L150 46L141 42L138 55Z" fill="#382741" />
      <path d="M145 67C149 70 152 68 154 65" stroke="#744950" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M137 85L143 120M155 83L150 103" stroke="#4D326C" strokeWidth="3" strokeLinecap="round" />
      <path d="M123 157H136V165H116C113 162 119 158 123 157M156 158H169L176 165H155Z" fill="#352146" />
      <path d="M195 114L184 158H198L210 119L216 158H230L227 113" fill="#AC88CF" />
      <path d="M196 84C207 78 222 83 227 91L237 126L190 127Z" fill="#FFF7E9" />
      <path d="M198 91L183 112L173 105M225 94L238 115L247 107" stroke="#FFF7E9" strokeWidth="12" strokeLinecap="round" />
      <path d="M172 103L168 99M247 105L251 99" stroke="#E4A17C" strokeWidth="8" strokeLinecap="round" />
      <path d="M208 71V86L218 88V70" fill="#D88768" />
      <circle cx="218" cy="38" r="10" fill="#A85949" />
      <path d="M199 51C197 34 222 37 225 51L228 76L221 80L218 61Z" fill="#A85949" />
      <path d="M202 49C211 44 221 52 222 64C224 76 211 80 204 69Z" fill="#EEB08B" />
      <path d="M202 48C205 40 218 42 223 53C214 56 209 53 207 46L201 57Z" fill="#A85949" />
      <path d="M211 70C215 72 218 70 219 68" stroke="#874953" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M185 156H199V165H179C177 161 182 158 185 156M216 157H230L237 165H216Z" fill="#694A85" />
      <path d="M59 23V33M54 28H64M178 20V30M173 25H183" stroke="#B39AD0" strokeWidth="3" strokeLinecap="round" />
      <path d="M262 156L274 147M270 159L278 157" stroke="#8B63BC" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
