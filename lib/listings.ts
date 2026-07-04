export interface Listing {
  id: string;
  price: number;
  title: string;
  street: string;
  suburb: string;
  beds: number;
  baths: number;
  garages: number;
}

// Hardcoded for the static homepage. Swap this for a Supabase query
// (e.g. `select * from listings where status = 'active'`) once the
// listings module is wired up.
export const listings: Listing[] = [
  {
    id: "beaulieu-shetland",
    price: 5499000,
    title: "Four-bedroom family home",
    street: "Shetland Street",
    suburb: "Beaulieu",
    beds: 4,
    baths: 3,
    garages: 2,
  },
  {
    id: "carlswald-oakwood",
    price: 3195000,
    title: "Cluster in a secure estate",
    street: "Oakwood Close",
    suburb: "Carlswald",
    beds: 3,
    baths: 2,
    garages: 2,
  },
  {
    id: "bluehills-acacia",
    price: 2650000,
    title: "Modern family townhouse",
    street: "Acacia Road",
    suburb: "Blue Hills",
    beds: 3,
    baths: 2,
    garages: 1,
  },
  {
    id: "noordwyk-fig",
    price: 1895000,
    title: "Freestanding starter home",
    street: "Fig Tree Lane",
    suburb: "Noordwyk",
    beds: 2,
    baths: 2,
    garages: 1,
  },
  {
    id: "glenferness-maple",
    price: 6950000,
    title: "Four-bedroom home on a full acre",
    street: "Maple Road",
    suburb: "Glenferness",
    beds: 4,
    baths: 3,
    garages: 3,
  },
  {
    id: "saddlebrook-bridle",
    price: 3950000,
    title: "Equestrian-estate family home",
    street: "Bridle Way",
    suburb: "Saddlebrook",
    beds: 4,
    baths: 3,
    garages: 2,
  },
];
