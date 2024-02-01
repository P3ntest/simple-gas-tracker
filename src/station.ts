import { useEffect, useState } from "react";
import { z } from "zod";

export const Station = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  street: z.string(),
  house_number: z.string(),
  post_code: z.number().nullable(),
  place: z.string(),
  lat: z.number(),
  lng: z.number(),
  dist: z.number(),
  //   opents: z.number(),
  prices: z.object({
    diesel: z.number().nullable(),
    e5: z.number().nullable(),
    e10: z.number().nullable(),
  }),
  //   openingTimes: z.object({
  //     openingTimes: z.array(
  //       z.object({
  //         applicable_days: z.number(),
  //         periods: z.array(
  //           z.object({
  //             startp: z.string(),
  //             endp: z.string(),
  //           })
  //         ),
  //       })
  //     ),
  //   }),
});

export type Station = z.infer<typeof Station>;

export async function getStations() {
  const response = await fetch(
    `https://tankerkoenig.de/ajax_v3_public/get_stations_near_postcode.php?postcode=${
      import.meta.env.VITE_HOME_PLACE
    }&radius=1`
  );
  const stations = await response.json();
  console.log(stations.data.stations);
  return Station.array().parse(stations.data.stations);
}

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);

  function updateStations() {
    getStations().then(setStations);
  }

  useEffect(() => {
    updateStations();
  }, []);

  return {
    stations,
    updateStations,
    cheapestPrices: useCheapestPrice(stations),
  };
}

export type FuelKey = keyof Station["prices"];
export type CheapestPrices = Partial<{
  [key in FuelKey]: number;
}>;

function useCheapestPrice(stations: Station[]) {
  const [cheapestPrices, setCheapestPrices] = useState<CheapestPrices>({});

  useEffect(() => {
    const newCheapestPrices: CheapestPrices = {};
    for (const fuelType of fuelTypes) {
      newCheapestPrices[fuelType.key] = Math.min(
        ...stations.map((station) => station.prices[fuelType.key] ?? Infinity)
      );
    }
    setCheapestPrices(newCheapestPrices);
  }, [stations]);

  return cheapestPrices;
}

export const fuelTypes: {
  key: FuelKey;
  label: string;
}[] = [
  {
    key: "diesel",
    label: "Diesel",
  },
  {
    key: "e5",
    label: "Super",
  },
  {
    key: "e10",
    label: "E10",
  },
];

export function googleMapsLink(station: Station) {
  return `https://www.google.com/maps/search/?api=1&query=${station.name}+${station.street}+${station.house_number}+${station.place}`;
}
