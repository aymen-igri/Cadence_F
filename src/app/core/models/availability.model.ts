export interface Plan {
  id: string;
  title: string;
  availabilityStatus: 'ACTIVE' | 'DISABLED';
  createdAt: string;
}

export interface slot {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  start: string;
  end: string;
  createdAt: string;
}
export type SlotRange = Omit<slot, 'id' | 'createdAt'>;

export interface AvailabilityPlan {
  plan: Plan;
  slots: slot[];
}

export interface CreateAvailabilityPlan {
  availabilityPlan: {
    title: string;
    planStatus: 'ACTIVE' | 'DISABLED';
  };
  slotsReq: Omit<slot, 'id' | 'createdAt'>[];
}
