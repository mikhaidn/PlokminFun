import { InstructionSet } from '../types';

export function getBearExampleInstructions(): InstructionSet {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    petName: 'Bear',
    ownerName: '',
    created: now,
    updated: now,
    generalNotes: "Don't love leaving Bear home for more than 6 hours without some sort of break or check-in, but he can do 8-9 hours fine when needed. He hasn't been asking to go out as much in general, so it's important to get him out before you leave. Unopened food in cabinet and Chewy box in living room.",
    tasks: [
      {
        id: crypto.randomUUID(),
        title: 'Give fluoxetine',
        description: '1/2 pull in the morning if possible',
        period: 'morning',
        category: 'medication',
        recurring: true,
        priority: 'high',
      },
      {
        id: crypto.randomUUID(),
        title: 'Take Bear out before leaving',
        description: "He hasn't been asking to go out as much, so proactive bathroom break is important",
        period: 'morning',
        category: 'bathroom',
        recurring: true,
        priority: 'high',
      },
      {
        id: crypto.randomUUID(),
        title: 'Fill treat ball and turn on Bluey',
        description: 'Before leaving for the day',
        period: 'morning',
        category: 'activity',
        recurring: true,
        priority: 'medium',
      },
      {
        id: crypto.randomUUID(),
        title: 'Check if Bear ate from bowl',
        description: 'If untouched by tonight, try Primal Freeze Dried Lamb. You can try it dry first. He eats it most consistently if you pour some hot water on it and let it sit for ~1 min',
        period: 'evening',
        category: 'feeding',
        recurring: true,
        priority: 'high',
      },
      {
        id: crypto.randomUUID(),
        title: 'Try alternative food if needed',
        description: "If he hasn't eaten anything by tomorrow, try any other food. There is more unopened food in the cabinet and in the Chewy box in the living room",
        period: 'anytime',
        category: 'feeding',
        recurring: false,
        priority: 'medium',
      },
    ],
  };
}
