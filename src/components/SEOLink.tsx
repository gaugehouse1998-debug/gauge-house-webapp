import React from 'react';

interface SEOLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  navigate?: (route: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const SEOLink: React.FC<SEOLinkProps> = ({
  to,
  navigate,
  children,
  className = '',
  onClick,
  ...rest
}) => {
  // Compute clean href for crawlers and new tab opens
  const cleanRoute = to.startsWith('/') ? to : '/' + to;
  // If hosted on GitHub Pages or custom domain, href can be #/route or clean route
  const href = `#${cleanRoute}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    // Allow standard browser handling for ctrl+click, meta+click, middle click, etc.
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      if (navigate) {
        navigate(cleanRoute);
      } else {
        window.location.hash = cleanRoute;
      }
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};
