type SpeakingAnimationProps = {
  isActive?: boolean;
  rows?: number;
  cols?: number;
};

const SpeakingAnimation: React.FC<SpeakingAnimationProps> = ({
  isActive = true,
  rows = 4,
  cols = 12,
}) => {
  const [activeDots, setActiveDots] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setActiveDots([]);
      return;
    }

    const interval = setInterval(() => {
      const totalDots = rows * cols;
      const newActiveDots = Array.from({
        length: Math.floor(totalDots / 3),
      }).map(() => Math.floor(Math.random() * totalDots));
      setActiveDots(newActiveDots);
    }, 400);

    return () => clearInterval(interval);
  }, [isActive, rows, cols]);

  return (
    <div
      className="tw-grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: "3px",
      }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "tw-h-[3px] tw-w-[3px] tw-rounded-full tw-transition-colors tw-duration-300", // Increased duration from 300 to 500
            activeDots.includes(i)
              ? "tw-bg-foreground"
              : "tw-bg-muted-foreground",
          )}
        />
      ))}
    </div>
  );
};

export default SpeakingAnimation;
