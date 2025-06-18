
interface AdminAuthErrorProps {
  showError: boolean;
  errorMessage: string;
}

export const AdminAuthError = ({ showError, errorMessage }: AdminAuthErrorProps) => {
  if (!showError) return null;

  return (
    <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      {errorMessage}
    </div>
  );
};
