import { catalogGroups } from './fleet-catalog';

type FleetProduct = {
  name: string;
  url: string;
  repo?: string;
  description: string;
  maturity: string;
};
export type FleetProductGroup = {
  label: string;
  kicker: string;
  intro: string;
  products: FleetProduct[];
};

export const fleetProductGroups: FleetProductGroup[] = catalogGroups.map(
  (group) => ({
    label: group.label,
    kicker: `// ${group.tier}`,
    intro: group.intro,
    products: group.entries.map((entry) => ({
      ...entry,
      maturity: group.tier === 'parked' ? 'inactive' : 'experiment',
    })),
  })
);
export const fleetProjectCount = fleetProductGroups.reduce(
  (count, group) => count + group.products.length,
  0
);
