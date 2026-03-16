import Image from 'next/image'

interface PageImageProps {
  src: string
  alt: string
  className?: string
}

export function PageImage({ src, alt, className }: PageImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={900}
      height={1273}
      className={className}
      style={{ width: '100%', height: 'auto' }}
    />
  )
}

export default PageImage
