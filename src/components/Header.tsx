import { Link } from "react-router-dom";

interface HeaderProps {
  orgName: string;
  orgAvatarUrl: string;
  year: number;
  generatedAt: string;
}

export function Header({ orgName, orgAvatarUrl, year, generatedAt }: HeaderProps) {
  return (
    <header className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-6xl mx-auto flex items-center gap-6">
        <img
          src={orgAvatarUrl}
          alt={orgName}
          className="w-16 h-16 rounded-full border-2 border-gray-600"
        />
        <div>
          <h1 className="text-3xl font-bold">
            <Link to="/" className="hover:text-gray-300 transition-colors">
              {orgName}
            </Link>
          </h1>
          <p className="text-gray-400 text-lg">{year} Organization Review</p>
          <p className="text-gray-500 text-sm">
            Generated {new Date(generatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </header>
  );
}
