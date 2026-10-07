import React from "react";

interface FestivalStripeProps {
  className?: string;
  height?: string;
}

/**
 * Authentic 5-color horizontal stripe from the KliK 2026 Festival Programme brochure:
 * Olive/Fynbos Green | Terracotta Rust | Warm Mustard Ochre | Coral Salmon | Ocean Teal Blue
 */
export const FestivalStripe: React.FC<FestivalStripeProps> = ({
  className = "",
  height = "h-1.5",
}) => {
  return (
    <div
      className={`flex w-full overflow-hidden rounded-full ${height} ${className}`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="flex-1 bg-[#485335]" title="Fynbos Olive Green" />
      <div className="flex-1 bg-[#D95338]" title="Terracotta Rust" />
      <div className="flex-1 bg-[#DE9E36]" title="Mustard Ochre" />
      <div className="flex-1 bg-[#E27D60]" title="Coral Salmon" />
      <div className="flex-1 bg-[#0E8294]" title="Ocean Teal" />
    </div>
  );
};
