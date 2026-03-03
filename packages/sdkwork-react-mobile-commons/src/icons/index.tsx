import React from 'react';

interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
}

const createIcon = (path: React.ReactNode, viewBox = '0 0 24 24') => {
  return ({ size = 24, color: _color = 'currentColor', className }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {path}
    </svg>
  );
};

// Navigation Icons
export const ChevronLeft = createIcon(
  <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const ChevronRight = createIcon(
  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const ChevronDown = createIcon(
  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const ChevronUp = createIcon(
  <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const ArrowLeft = createIcon(
  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const ArrowRight = createIcon(
  <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

// Action Icons
export const Plus = createIcon(
  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Minus = createIcon(
  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Close = createIcon(
  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Check = createIcon(
  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const MoreHorizontal = createIcon(
  <>
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
  </>
);

export const MoreVertical = createIcon(
  <>
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
    <circle cx="12" cy="5" r="1" fill="currentColor" />
  </>
);

// Communication Icons
export const MessageCircle = createIcon(
  <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Send = createIcon(
  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Phone = createIcon(
  <path d="M22 16.92V19.92C22.0016 20.483 21.8384 21.0336 21.5318 21.5082C21.2253 21.9828 20.79 22.3603 20.2806 22.5926C19.7712 22.8249 19.2096 22.9022 18.6598 22.8152C18.11 22.7282 17.5958 22.4804 17.18 22.1C15.2422 20.4053 13.5307 18.4618 12.1 16.32C10.7356 14.2861 9.62795 12.0865 8.8 9.77C8.40001 8.72 8.30001 7.6 8.50001 6.51C8.70001 5.42 9.20001 4.4 9.95001 3.54C10.5369 2.85702 11.3199 2.37439 12.19 2.16003L14.71 1.55003C15.3294 1.40055 15.9803 1.51481 16.5189 1.86989C17.0575 2.22497 17.4417 2.79277 17.59 3.44003L18.36 6.76003C18.4662 7.2099 18.4419 7.68023 18.2903 8.11626C18.1387 8.55229 17.8661 8.93546 17.505 9.22003L15.5 10.82C16.5924 12.7269 17.9642 14.4537 19.57 15.94L21.17 13.94C21.4546 13.5789 21.8377 13.3063 22.2738 13.1547C22.7098 13.0031 23.1801 12.9788 23.63 13.08L26.95 13.85C27.5973 13.9983 28.1651 14.3825 28.5201 14.9211C28.8752 15.4597 28.9895 16.1106 28.84 16.73L28.23 19.25C28.0157 20.1201 27.533 20.9031 26.85 21.49C25.99 22.24 24.97 22.74 23.88 22.94C22.79 23.14 21.67 23.04 20.62 22.64L22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Video = createIcon(
  <>
    <path d="M23 7L16 12L23 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

// Status Icons
export const AlertCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

export const AlertTriangle = createIcon(
  <path d="M10.29 3.86L1.82 18C1.64549 18.3024 1.55298 18.6453 1.55201 18.9945C1.55103 19.3437 1.64162 19.6871 1.81442 19.9905C1.98722 20.2939 2.23648 20.5467 2.53754 20.7239C2.83861 20.901 3.18075 20.9962 3.53 21H20.47C20.8192 20.9962 21.1614 20.901 21.4625 20.7239C21.7635 20.5467 22.0128 20.2939 22.1856 19.9905C22.3584 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3545 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9822 3.15548C12.6838 2.98785 12.3486 2.90125 12.0075 2.90423C11.6664 2.90721 11.3327 2.99968 11.0371 3.1725C10.7416 3.34532 10.4947 3.59258 10.3214 3.88977L10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Info = createIcon(
  <>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

// User Icons
export const User = createIcon(
  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Users = createIcon(
  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Settings = createIcon(
  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15ZM12 15V19.5M12 19.5L9 22.5M12 19.5L15 22.5M19.5 12H22.5M22.5 12L19.5 9M22.5 12L19.5 15M12 4.5V1.5M12 1.5L9 4.5M12 1.5L15 4.5M4.5 12H1.5M1.5 12L4.5 9M1.5 12L4.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

// File Icons
export const File = createIcon(
  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Image = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

export const Folder = createIcon(
  <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

// Media Icons
export const Play = createIcon(
  <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Pause = createIcon(
  <>
    <rect x="6" y="4" width="4" height="16" fill="currentColor" />
    <rect x="14" y="4" width="4" height="16" fill="currentColor" />
  </>
);

export const Search = createIcon(
  <>
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

export const Menu = createIcon(
  <>
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

export const Heart = createIcon(
  <path d="M20.84 4.61C20.3292 4.09901 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99818 16.95 2.99818C16.2275 2.99818 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.09901 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.9379 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61V4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Share = createIcon(
  <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12M16 6L12 2M12 2L8 6M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Download = createIcon(
  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Upload = createIcon(
  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

// Notification Icons
export const Bell = createIcon(
  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Mail = createIcon(
  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

// Time Icons
export const Clock = createIcon(
  <>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

export const Calendar = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

// Security Icons
export const Lock = createIcon(
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Unlock = createIcon(
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

export const Shield = createIcon(
  <path d="M12 22S3 18 3 9V5L12 2L21 5V9C21 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
);

// All icons export
export const icons = {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Close,
  Check,
  MoreHorizontal,
  MoreVertical,
  MessageCircle,
  Send,
  Phone,
  Video,
  AlertCircle,
  AlertTriangle,
  Info,
  User,
  Users,
  Settings,
  File,
  Image,
  Folder,
  Play,
  Pause,
  Search,
  Menu,
  Heart,
  Share,
  Download,
  Upload,
  Bell,
  Mail,
  Clock,
  Calendar,
  Lock,
  Unlock,
  Shield,
};

export type IconName = keyof typeof icons;
