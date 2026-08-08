export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Account Pending Approval</h1>
        <p className="text-gray-500 max-w-md">
          Thanks for signing up! An admin needs to review and approve your
          account before you can access the platform. This usually doesn't
          take long — check back soon.
        </p>
      </div>
    </div>
  );
}