import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        goalPlanner: resolve(__dirname, 'goal-planner/index.html'),
        riskProfiling: resolve(__dirname, 'risk-profiling/index.html'),
        insuranceCalculator: resolve(__dirname, 'insurance-calculator/index.html'),
        emergencyFund: resolve(__dirname, 'emergency-fund/index.html'),
        wealthOptimizer: resolve(__dirname, 'wealth-optimizer/index.html'),
        debtWealthOptimizer: resolve(__dirname, 'debt-wealth-optimizer/index.html'),
      },
    },
  },
});
