import { exportWeeklyMealPlanToCsv } from './weeklyExport';

describe('weekly export', () => {
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:nutrismart');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('creates downloadable csv with safe filename and escaped cells', () => {
    const click = jest.fn();
    let createdLink;
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = originalCreateElement(tag);
      if (tag === 'a') {
        element.click = click;
        createdLink = element;
      }
      return element;
    });

    exportWeeklyMealPlanToCsv({
      startDate: '2026-04-25',
      days: [{
        date: '2026-04-25',
        label: 'Szombat',
        totalCalories: 1200,
        totalProteinG: 100.5,
        totalCarbsG: 130,
        totalFatG: 40,
        meals: [{
          mealLabel: 'Reggeli',
          recipeName: 'Zab "extra"',
          targetCalories: 500,
          totalCalories: 510,
          totalProteinG: 31.2,
          totalCarbsG: 60,
          totalFatG: 11,
          items: [{ foodName: 'Zab', quantityG: 80.4 }],
        }],
      }],
    }, 'Teszt Elek');

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(createdLink.download).toBe('heti-menu-teszt-elek-2026-04-25.csv');
    expect(click).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:nutrismart');
  });
});
