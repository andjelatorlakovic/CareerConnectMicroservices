export const JobCategory = {
  SoftwareDevelopment: 'SoftwareDevelopment',
  MobileDevelopment: 'MobileDevelopment',
  DevOps: 'DevOps',
  DataScience: 'DataScience',
  QualityAssurance: 'QualityAssurance',
  UIUXDesign: 'UIUXDesign',
  Marketing: 'Marketing',
  Sales: 'Sales',
  HumanResources: 'HumanResources',
  Finance: 'Finance',
} as const;

export type JobCategory =
  (typeof JobCategory)[keyof typeof JobCategory];