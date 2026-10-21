import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  className?: string
  imageClassName?: string
  variant?: 'default' | 'light' | 'white-text'
}

export function Logo({ className = '', imageClassName = '', variant = 'default' }: LogoProps) {
  const src = variant === 'white-text' ? '/assets/dzoraLogo-white-text.webp' : '/assets/dzoraLogo.webp'

  return (
    <Link href="/" className={`inline-flex items-center shrink-0 py-1 ${className}`}>
      <Image
        src={src}
        alt="Dzora - Tout ce dont vous avez besoin"
        width={320}
        height={144}
        priority
        className={`h-14 sm:h-16 md:h-20 w-auto object-contain transition-all duration-200 ${
          variant === 'light' ? 'brightness-0 invert' : ''
        } ${imageClassName}`}
      />
    </Link>
  )
}
