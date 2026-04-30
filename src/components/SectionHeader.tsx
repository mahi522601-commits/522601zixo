import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  emoji?: string;
  viewAllHref?: string;
}

export default function SectionHeader({ title, emoji, viewAllHref = "#" }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-[#F0C040]">
        {emoji && <span className="mr-2">{emoji}</span>}
        {title}
      </h2>
      <a
        href={viewAllHref}
        className="flex items-center text-sm font-medium text-[#FFF8E7]/80 hover:text-[#F0C040] transition-colors"
      >
        View all
        <ChevronRight className="w-4 h-4 ml-1 text-[#C9960C]" />
      </a>
    </div>
  );
}
