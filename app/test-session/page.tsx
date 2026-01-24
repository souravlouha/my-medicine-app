import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TestSessionPage() {
  const session = await auth();

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">Vercel Session Debugger</h1>
      
      <div className="border p-4 rounded bg-gray-100">
        <h2 className="font-bold">1. Authentication Status:</h2>
        {session ? (
          <p className="text-green-600 font-bold">✅ Logged In</p>
        ) : (
          <p className="text-red-600 font-bold">❌ Not Logged In (Session is null)</p>
        )}
      </div>

      <div className="border p-4 rounded bg-gray-100">
        <h2 className="font-bold">2. User Details:</h2>
        <pre className="text-sm bg-black text-white p-2 rounded">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="border p-4 rounded bg-gray-100">
        <h2 className="font-bold">3. Environment Variables Check:</h2>
        <p>AUTH_SECRET Set? : {process.env.AUTH_SECRET ? "✅ Yes" : "❌ No"}</p>
        <p>AUTH_URL Set? : {process.env.AUTH_URL ? "✅ Yes" : "❌ No"}</p>
        <p>NODE_ENV : {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
}