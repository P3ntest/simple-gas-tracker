import { useState } from "react";
import {
  CheapestPrices,
  FuelKey,
  Station,
  fuelTypes,
  googleMapsLink,
  useStations,
} from "./station";
import { twMerge } from "tailwind-merge";

export function App() {
  const { stations, cheapestPrices } = useStations();
  const [selectedFuelType, setSelectedFuelType] = useState<FuelKey>("e5");

  if (!stations) return null;

  const sortedStations = stations.sort((a, b) => {
    return (
      (a.prices[selectedFuelType] ?? Math.min()) -
      (b.prices[selectedFuelType] ?? Math.min())
    );
  });

  return (
    <div className="flex flex-col items-center py-10 gap-10">
      <h1 className="text-slate-200 text-2xl font-black">⛽ GAS PRICES 🚘</h1>
      <div className="flex gap-2">
        {fuelTypes.map(({ label, key }) => (
          <button
            className={twMerge(
              "p-2 rounded text-lg border",
              selectedFuelType === key
                ? "bg-slate-600 text-slate-200 border-slate-500"
                : "bg-slate-800 text-slate-400 border-transparent"
            )}
            onClick={() => setSelectedFuelType(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1">
        {sortedStations.map((station) => (
          <StationComponent
            key={station.id}
            station={station}
            cheapestPrices={cheapestPrices}
            highlight={
              station.prices[selectedFuelType] ===
              cheapestPrices[selectedFuelType]
            }
          />
        ))}
      </div>
    </div>
  );
}

function StationComponent({
  station,
  cheapestPrices,
  highlight,
}: {
  station: Station;
  cheapestPrices: CheapestPrices;
  highlight: boolean;
}) {
  return (
    <a
      className={twMerge(
        "bg-slate-800 p-2 rounded-lg m-3 text-slate-200 shadow-xl border border-slate-700",
        highlight && "border-2 border-green-500 "
      )}
      href={googleMapsLink(station)}
      target="_blank"
    >
      <div className="flex flex-col gap-2">
        <div>
          <div className="text-lg font-bold">
            {highlight ? "🌟" : "⛽"} {station.name}
          </div>
          <div className="text-sm text-slate-400">
            <span className="capitalize">
              {station.street.toLowerCase()} {station.house_number},{" "}
              {station.place.toLowerCase()}
            </span>
          </div>
        </div>
        <table className="">
          <thead>
            <tr>
              {fuelTypes.map(({ label, key }) => {
                const isCheapest = cheapestPrices[key] === station.prices[key];
                return (
                  <th className="text-left w-1/3 text-slate-200">
                    {label}
                    {isCheapest && (
                      <span className="text-green-400 text-xs"> ⭐</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {fuelTypes.map(({ key }) => (
                <td className="text-left font-thin">
                  {station.prices[key] ? station.prices[key] + " €" : "-"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </a>
  );
}
