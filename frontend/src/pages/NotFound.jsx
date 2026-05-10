import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <AlertTriangle className="text-primary-400" size={56} />
      <h1 className="mt-4 text-6xl font-extrabold text-gray-900">404</h1>
      <p className="mt-2 text-lg text-gray-500">
        Sorry, the page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
