import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PointTransaction } from '../types';

interface PointState {
  transactions: PointTransaction[];
  addTransaction: (transaction: Omit<PointTransaction, 'id' | 'timestamp'>) => void;
  clearTransactions: () => void;
}

export const usePointStore = create<PointState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              ...transaction,
            },
            ...state.transactions,
          ],
        })),
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: 'point-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            transactions: persistedState.transactions.map((t: PointTransaction) => ({
              ...t,
              timestamp: t.timestamp || new Date().toISOString(),
            })),
          };
        }
        return persistedState;
      },
    }
  )
);