"use client";

type ComingSoonModalProps = {
  isOpen: boolean;
  feature: "lists" | "roadmaps" | null;
  onClose: () => void;
};

export default function ComingSoonModal({
  isOpen,
  feature,
  onClose,
}: ComingSoonModalProps) {
  if (!isOpen) return null;

  const message =
    feature === "lists"
      ? "This will be where you can keep track of custom lists you curate based on the searches you make on leet search. You will be able to share and receive lists with friends!"
      : feature === "roadmaps"
      ? "Have you ever used the neetcode roadmap and thought that it wasn't granular enough for your use case and skill level?"
      : null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#050507] border border-[#2a2a2f] max-w-md w-full p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#06b6d4]">
            Coming soon!
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p className="text-sm text-zinc-300">{message}</p>
      </div>
    </div>
  );
}

