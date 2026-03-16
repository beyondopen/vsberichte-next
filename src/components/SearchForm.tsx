interface SearchFormProps {
  defaultValue?: string;
  size?: "sm" | "lg";
}

export default function SearchForm({
  defaultValue = "",
  size = "sm",
}: SearchFormProps) {
  const inputClass =
    size === "lg"
      ? "flex-1 px-5 py-3.5 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
      : "flex-1 px-4 py-2.5 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const buttonClass =
    size === "lg"
      ? "px-6 py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
      : "px-5 py-2.5 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors";

  return (
    <form action="/suche" method="get" className="flex gap-3">
      <label htmlFor="search-input" className="sr-only">
        Suchbegriff
      </label>
      <input
        id="search-input"
        name="q"
        type="search"
        placeholder="Suchbegriff eingeben&#8230;"
        defaultValue={defaultValue}
        className={inputClass}
      />
      <button type="submit" className={buttonClass}>
        Suchen
      </button>
    </form>
  );
}
