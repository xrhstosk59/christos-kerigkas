// src/lib/image-loader.ts
interface ImageLoaderProps {
    src: string;
    width: number;
    quality?: number;
   }
   
   export default function imageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
    return `https://res.cloudinary.com/your-cloudinary-name/image/fetch/q_${quality},w_${width}/${src}`
   }