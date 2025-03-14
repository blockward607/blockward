
interface ErrorDisplayProps {
  message: string;
  show: boolean;
}

export const ErrorDisplay = ({ message, show }: ErrorDisplayProps) => {
  if (!show) return null;
  
  return (
    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
      {message}
    </div>
  );
};
