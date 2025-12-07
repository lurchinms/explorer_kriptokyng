"use client";

import { useEffect, useRef } from "react";

export function Ticker() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the CoinGecko widget script
    const script = document.createElement("script");
    script.src =
      "https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        gecko-marquee {
          background: #000000 !important;
        }

        gecko-coin-price-marquee-widget::part(gecko-widget) {
          width: 100%;
        }
      `}</style>
      <div
        ref={containerRef}
        className="w-full col-lg-12 col-md-12 col-sm-12 col-xs-12 bg-black"
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `<gecko-coin-price-marquee-widget
              locale="en"
              dark-mode="true"
              coin-ids="bitcoin,litecoin,peercoin,digibyte,deutsche-emark,auroracoin,cpucoin,bitoreum,dogecoin,monero,ravencoin"
              initial-currency="usd"
            ></gecko-coin-price-marquee-widget>`,
          }}
        />
      </div>
    </>
  );
}
