"use client";

interface UserRow {
  _id: string;
  name: string;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
}

export function UserTable({
  users,
  onSuspend,
  onReinstate,
}: {
  users: UserRow[] | undefined;
  onSuspend: (id: string) => void;
  onReinstate: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">2FA</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users === undefined && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                Loading…
              </td>
            </tr>
          )}
          {users?.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                No users found
              </td>
            </tr>
          )}
          {users?.map((u) => (
            <tr key={u._id} className="border-t border-gray-100">
              <td className="px-4 py-3">{u.name}</td>
              <td className="px-4 py-3">{u.role}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : u.status === "SUSPENDED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3">{u.twoFactorEnabled ? "On" : "Off"}</td>
              <td className="px-4 py-3 text-right space-x-2">
                {u.status !== "SUSPENDED" ? (
                  <button
                    onClick={() => onSuspend(u._id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => onReinstate(u._id)}
                    className="text-green-600 hover:underline text-xs"
                  >
                    Reinstate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}