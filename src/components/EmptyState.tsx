import { Icon, type IconName } from "@/components/Icon";

export function EmptyState({ title, description, icon = "wish", children }: {
  title?: string;
  description?: string;
  icon?: IconName;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <svg viewBox="0 0 180 110" className="empty-art" fill="none" aria-hidden="true">
        <path d="M24 89C5 60 25 26 54 31C66 4 116 7 124 34C165 24 184 70 156 92Z" fill="#F0E5F8" />
        <circle cx="138" cy="29" r="15" fill="#FFE0BE" />
        <ellipse cx="91" cy="98" rx="53" ry="6" fill="#D9C6EC" />
        <rect x="55" y="23" width="68" height="74" rx="19" fill="#FFF9EF" transform="rotate(-8 89 60)" />
        <svg x="71" y="42" width="37" height="37" viewBox="0 0 24 24" color="#8157AE"><Icon name={icon} /></svg>
        <path d="M32 50V62M26 56H38M140 75V85M135 80H145" stroke="#B497CD" strokeWidth="3" strokeLinecap="round" />
        <path d="M23 97L22 81C7 76 11 62 16 61C28 67 31 80 22 86M23 92C38 91 42 79 37 73C26 75 20 83 23 92" fill="#A0AF8E" />
      </svg>
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
