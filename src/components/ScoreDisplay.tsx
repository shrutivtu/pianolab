interface ScoreDisplayProps {
  correct: number;
  wrong: number;
}

export function ScoreDisplay({ correct, wrong }: ScoreDisplayProps) {
  return (
    <div
      className="flex items-center gap-3 text-sm font-medium tabular-nums"
      aria-label={`Score: ${correct} correct, ${wrong} wrong`}
    >
      <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
        <span className="size-1.5 rounded-full bg-green-500" />
        {correct}
      </span>
      <span className="text-neutral-300 dark:text-neutral-700">·</span>
      <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
        <span className="size-1.5 rounded-full bg-red-500" />
        {wrong}
      </span>
    </div>
  );
}
