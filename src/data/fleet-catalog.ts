// Public projection from Site Health via SaaS Maker; never load private Fleet data here.
import publicCatalog from './fleet-public.json';

export type CatalogEntry = {
  id: string;
  name: string;
  tier: 'focus' | 'active' | 'secondary' | 'parked';
  priority: 'P1' | 'P2' | 'P4';
  kind: 'product' | 'platform' | 'experiment';
  family: string;
  url: string;
  domains: string[];
  repo?: string;
  description: string;
};

export type CatalogGroup = {
  tier: CatalogEntry['tier'];
  label: string;
  intro: string;
  entries: CatalogEntry[];
};

export const fleetCatalog: readonly CatalogEntry[] =
  publicCatalog.directory.map((project) => ({
    id: project.id,
    name: project.name,
    tier:
      project.lifecycle === 'primary'
        ? 'focus'
        : project.lifecycle === 'active'
          ? 'active'
          : 'parked',
    priority: project.lifecycle === 'primary' ? 'P1' : 'P2',
    kind: project.kind as CatalogEntry['kind'],
    family: project.id,
    url:
      project.url ?? project.repositoryUrl ?? 'https://sassmaker.com/projects',
    domains: project.domains,
    repo: project.repositoryUrl,
    description: project.description,
  }));

export const catalogGroups: readonly CatalogGroup[] = [
  {
    tier: 'focus',
    label: 'Featured',
    intro: 'Shareable work from my primary focus.',
    entries: fleetCatalog.filter((project) => project.tier === 'focus'),
  },
  {
    tier: 'active',
    label: 'Current work',
    intro: 'Working public experiments receiving active attention.',
    entries: fleetCatalog.filter((project) => project.tier === 'active'),
  },
  {
    tier: 'parked',
    label: 'Past work',
    intro: 'Useful retained work without an active development commitment.',
    entries: fleetCatalog.filter((project) => project.tier === 'parked'),
  },
];
