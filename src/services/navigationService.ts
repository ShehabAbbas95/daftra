import { NavItem, DragAnalytics } from '../types/navigation';

const BASE_URL = 'http://localhost:8081';

export const navigationService = {
  async getNavigation(): Promise<NavItem[]> {
    const response = await fetch(`${BASE_URL}/nav`);
    return response.json();
  },

  async saveNavigation(navigation: NavItem[]): Promise<void> {
    await fetch(`${BASE_URL}/nav`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(navigation),
    });
  },

  async trackDragAndDrop(analytics: DragAnalytics): Promise<void> {
    await fetch(`${BASE_URL}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analytics),
    });
  },
};