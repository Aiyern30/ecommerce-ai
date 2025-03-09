import Image from "next/image";
import Link from "next/link";

interface StyleCardProps {
  title: string;
  image: string;
  path: string; // Add path as a prop
}

export function StyleCard({ title, image, path }: StyleCardProps) {
  return (
    <Link
      href={path}
      className="group relative block overflow-hidden rounded-lg"
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-black/40">
        <div className="flex h-full items-center justify-center">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
      </div>
    </Link>
  );
}
