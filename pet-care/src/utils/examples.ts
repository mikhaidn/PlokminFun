import { InstructionSet } from '../types';

export function getExampleInstructions(): InstructionSet {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    petName: 'Example Pet',
    ownerName: '',
    created: now,
    updated: now,
    generalNotes:
      'Add general care notes here. For example: feeding schedule, behavioral notes, emergency contacts, etc.',
    tasks: [
      {
        id: crypto.randomUUID(),
        title: 'Morning medication',
        description: 'Describe medication dosage and timing',
        period: 'morning',
        category: 'medication',
        recurring: true,
        priority: 'high',
      },
      {
        id: crypto.randomUUID(),
        title: 'Morning walk',
        description: 'Take outside for bathroom break',
        period: 'morning',
        category: 'bathroom',
        recurring: true,
        priority: 'high',
      },
      {
        id: crypto.randomUUID(),
        title: 'Feed breakfast',
        description: 'Regular food, 1 cup',
        period: 'morning',
        category: 'feeding',
        recurring: true,
        priority: 'high',
      },
      {
        id: crypto.randomUUID(),
        title: 'Evening walk',
        description: 'Take outside for exercise and bathroom',
        period: 'evening',
        category: 'bathroom',
        recurring: true,
        priority: 'high',
      },
      {
        id: crypto.randomUUID(),
        title: 'Feed dinner',
        description: 'Regular food, 1 cup',
        period: 'evening',
        category: 'feeding',
        recurring: true,
        priority: 'high',
      },
    ],
  };
}
