import React, { useId } from 'react'

export interface AlgeriaFlagProps {
  className?: string
  width?: number | string
  height?: number | string
}

/**
 * Drapeau officiel de la République Algérienne Démocratique et Populaire.
 * Ratio 3:2, moitié verte (#006233), moitié blanche (#ffffff),
 * croissant et étoile rouges (#D21034) centrés.
 *
 * Utilise SVG vectoriel net sur tous les navigateurs et OS (évite les bugs
 * d'affichage des emojis drapeau 🇩🇿 sur Windows/Chrome).
 */
export function AlgeriaFlag({
  className = 'h-3.5 w-5 rounded-[2px]',
  width,
  height,
}: AlgeriaFlagProps) {
  const maskId = useId()
  const cleanId = `dz-flag-mask-${maskId.replace(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <svg
      viewBox="0 0 900 600"
      width={width}
      height={height}
      className={`inline-block shrink-0 overflow-hidden ${className}`}
      aria-label="Drapeau algérien"
      role="img"
    >
      <defs>
        <mask id={cleanId}>
          <rect width="900" height="600" fill="white" />
          <circle cx="486" cy="300" r="120" fill="black" />
        </mask>
      </defs>
      {/* Vert (moitié gauche) */}
      <rect width="450" height="600" fill="#006233" />
      {/* Blanc (moitié droite) */}
      <rect x="450" width="450" height="600" fill="#ffffff" />
      {/* Croissant rouge */}
      <circle cx="450" cy="300" r="150" fill="#D21034" mask={`url(#${cleanId})`} />
      {/* Étoile rouge à 5 branches */}
      <polygon
        points="435,300 476,286 477,243 502,278 545,264 519,299 545,334 502,320 477,355 476,312"
        fill="#D21034"
      />
    </svg>
  )
}
