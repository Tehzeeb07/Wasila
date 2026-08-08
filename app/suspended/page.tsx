export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2 text-red-600">Account Suspended</h1>
        <p className="text-gray-500 max-w-md">
          Your account has been suspended. If you believe this is a mistake,
          please contact support.
        </p>
      </div>
    </div>
  );
}