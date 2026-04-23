import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  // Already signed in → skip the form, go straight to the intended page.
  if (session?.user) {
    redirect(callbackUrl || "/dashboard");
  }

  const errorMessage =
    error === "AccessDenied"
      ? "That email isn't authorized. Sign in with a @wonder.dog account."
      : error
      ? "Sign-in failed. Try again."
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 text-neutral-900">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">Wonderdog Spark</h1>
        <p className="mt-1 text-sm text-neutral-500">Employees only.</p>

        {errorMessage ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google", {
              redirectTo: callbackUrl || "/dashboard",
            });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <svg
              aria-hidden
              viewBox="0 0 48 48"
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2a12 12 0 0 1-18.6-5.6l-6.5 5A20 20 0 0 0 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C39.8 34 44 29.5 44 24c0-1.2-.1-2.3-.4-3.5z"
              />
            </svg>
            Sign in with Google
          </button>
        </form>

        <p className="mt-6 text-xs text-neutral-400">
          Access is limited to Wonderdog employees.
        </p>
      </div>
    </div>
  );
}
