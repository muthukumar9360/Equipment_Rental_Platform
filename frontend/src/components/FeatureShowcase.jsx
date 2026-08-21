import React from "react";

export const ScrollStackSection = ({
  sectionTitle = "How Equipora works?",
  cards = [],
}) => {
  return (
    <section className="relative min-h-screen bg-[#f8f9fa] px-4 sm:px-6 md:px-12 lg:px-12">
      {/* Normal Section Title (Removed sticky to fix glitch) */}
      <div className="py-2 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
          {sectionTitle}
        </h2>
      </div>

      {/* Cards Container */}
      <div className="relative mx-auto mt-12 max-w-[1400px]">
        {cards.map((card, index) => (
          <div
            key={index}
            className="sticky mb-10"
            style={{
              top: `${160 + index * 24}px`,
              zIndex: index + 1,
            }}
          >
            <div className="min-h-[420px] rounded-[2.5rem] bg-white p-7 shadow-[0_-8px_40px_rgba(0,0,0,0.08)] border border-gray-100 md:min-h-[460px] md:p-10">
              <div className="flex h-full min-h-[360px] flex-col gap-8 md:flex-row md:items-center md:gap-12">
                
                {/* Image */}
                <div className="w-full shrink-0 md:w-[350px] lg:w-[400px]">
                  <div className="overflow-hidden rounded-[2rem] shadow-inner bg-gray-100">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-[280px] w-full object-cover md:h-[400px] transform transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-center py-4">
                  <h3 className="max-w-[650px] text-3xl font-extrabold leading-[1.15] tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                    {card.title}
                  </h3>

                  <p className="mt-5 max-w-[700px] text-lg font-medium leading-relaxed text-gray-500 md:text-xl">
                    {card.description}
                  </p>

                  {/* Features */}
                  <div className="mt-8 space-y-4">
                    {card.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-4"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>

                        <span className="text-lg font-bold text-gray-800">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Extra space so the last card can finish stacking */}
        <div className="h-[25vh]" />
      </div>
    </section>
  );
};

export const EquiporaFeatureShowcases = () => {
  const equiporaCards = [
    {
      title: "Rent smart. Get more done.",
      description: "From finding the right equipment to getting it delivered, everything happens in just a few simple steps on our unified platform.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
      features: [
        "Search thousands of local listings",
        "Easy and highly secure booking",
        "Access industrial equipment when you need it",
      ]
    },
    {
      title: "Turn idle equipment into income.",
      description: "Don't let your heavy machinery gather dust. List your assets on Equipora and connect with renters who need them today.",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80",
      features: [
        "List your equipment completely free",
        "Set your own flexible rental rates",
        "Guaranteed secure payouts",
      ]
    },
    {
      title: "A marketplace built on trust.",
      description: "We believe in secure transactions. Our comprehensive Trust-First verification system ensures every user is exactly who they say they are.",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
      features: [
        "Mandatory KYC identity verification",
        "Admin-reviewed user profiles",
        "Transparent two-way rating system",
      ]
    },
    {
      title: "We're here to help you succeed.",
      description: "Whether you're renting your first tool or managing a massive fleet, our dedicated support team has your back every step of the way.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
      features: [
        "24/7 dedicated customer support",
        "Comprehensive dispute resolution",
        "Clear, enforceable platform guidelines",
      ]
    },
    {
      title: "Transparent pricing. No hidden fees.",
      description: "What you see is exactly what you pay. We ensure completely transparent pricing, dynamic security deposits, and secure payment processing.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
      features: [
        "No hidden convenience fees",
        "Highly secure escrow payments",
        "Instant security deposit refunds",
      ]
    }
  ];

  return <ScrollStackSection sectionTitle="Why Choose Equipora?" cards={equiporaCards} />;
};
