export default function MarqueeBar() {
  const text = "ZIXOCOOKIES ";
  const repeatedText = text.repeat(30);

  return (
    <div className="bg-brand-red text-white py-2.5 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="text-sm font-bold tracking-wider">
          {repeatedText}
        </span>
        <span className="text-sm font-bold tracking-wider">
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
