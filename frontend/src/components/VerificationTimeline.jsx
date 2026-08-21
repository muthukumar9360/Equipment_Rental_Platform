import React from 'react';

const VerificationTimeline = ({ kycStatus }) => {
  const steps = [
    { title: "Account Created", description: "Welcome to Equipora" },
    { title: "Contact Verified", description: "Email & Mobile linked" },
    { title: "Documents Submitted", description: "Identity proofs uploaded" },
    { title: "Admin Review", description: "Manual verification" },
    { title: "Active", description: "Ready to rent & host" }
  ];

  // Determine current step index based on kycStatus
  let currentStepIndex = 0;
  if (kycStatus === 'Fully Verified') {
    currentStepIndex = 5;
  } else if (kycStatus === 'Identity Submitted' || kycStatus === 'Pending Review') {
    currentStepIndex = 3;
  } else if (kycStatus === 'Basic Verified') {
    currentStepIndex = 2;
  } else {
    currentStepIndex = 1;
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Verification Progress</h3>
        <p className="text-gray-500 text-sm mt-1">
          Complete these steps to unlock full access to Equipora's premium marketplace.
        </p>
      </div>

      <div className="relative">
        {/* Desktop Line */}
        <div className="hidden md:block absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full" />
        {/* Desktop Progress Line */}
        <div 
          className="hidden md:block absolute top-5 left-0 h-1 bg-blue-600 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${(Math.min(currentStepIndex, 4) / 4) * 100}%` }}
        />

        {/* Mobile Line */}
        <div className="block md:hidden absolute top-0 left-5 w-1 h-full bg-gray-100 rounded-full" />
        {/* Mobile Progress Line */}
        <div 
          className="block md:hidden absolute top-0 left-5 w-1 bg-blue-600 rounded-full transition-all duration-1000 ease-out"
          style={{ height: `${(Math.min(currentStepIndex, 4) / 4) * 100}%` }}
        />

        <div className="flex flex-col md:flex-row justify-between relative z-10 space-y-6 md:space-y-0">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div key={index} className="flex md:flex-col items-center md:text-center w-full relative">
                
                {/* Icon Container */}
                <div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 mb-0 md:mb-3 transition-colors duration-500 
                    ${isCompleted ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 
                      isCurrent ? 'bg-white border-4 border-blue-600 text-blue-600 shadow-lg animate-pulse' : 
                      'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <span className="text-sm md:text-base font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Text Details */}
                <div className="ml-4 md:ml-0 md:mt-2 text-left md:text-center w-full">
                  <h4 className={`text-sm md:text-base font-bold transition-colors ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs md:text-sm mt-0.5 md:mt-1 max-w-[120px] mx-auto hidden md:block ${isCompleted || isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>
                    {step.description}
                  </p>
                  <p className={`text-xs mt-0.5 block md:hidden ${isCompleted || isCurrent ? 'text-gray-500' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerificationTimeline;
