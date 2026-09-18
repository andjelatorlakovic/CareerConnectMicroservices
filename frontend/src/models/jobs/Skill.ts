export const Skill = {
  CSharp: 'CSharp',
  Java: 'Java',
  Python: 'Python',
  JavaScript: 'JavaScript',
  TypeScript: 'TypeScript',
  SQL: 'SQL',
  HTML: 'HTML',
  CSS: 'CSS',
  React: 'React',
  Angular: 'Angular',
  Vue: 'Vue',
  NodeJS: 'NodeJS',
  ExpressJS: 'ExpressJS',
  Django: 'Django',
  Flask: 'Flask',
  SpringBoot: 'SpringBoot',
  RubyOnRails: 'RubyOnRails',
  PHP: 'PHP',
  Laravel: 'Laravel',
  Swift: 'Swift',
  Kotlin: 'Kotlin',
} as const;

export type Skill =
  (typeof Skill)[keyof typeof Skill];