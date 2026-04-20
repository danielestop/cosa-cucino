export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">🍲</div>
        <h1 className="text-4xl font-bold text-[#C65D3B] mb-3">
          Cosa Cucino?
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Il ricettario intelligente per tutta la famiglia
        </p>
        <div className="flex gap-3 justify-center">
          <button className="px-6 py-3 bg-[#6B8E4E] text-white rounded-xl font-medium shadow-md hover:shadow-lg transition">
            👨 Adulti
          </button>
          <button className="px-6 py-3 bg-[#7FB9D4] text-white rounded-xl font-medium shadow-md hover:shadow-lg transition">
            👶 Bambino
          </button>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          🚧 App in sviluppo — v0.1 MVP
        </p>
      </div>
    </main>
  );
}