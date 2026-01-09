// frontend/src/store/contractStore.js

import { defineStore } from "pinia";

export const useContractStore = defineStore('contracts', {
  state: () => ({
    contracts: [],
    currentReport: null,
  }),

  actions: {
    setContracts(list) {
      this.contracts = list;
    },
    setCurrentReport(report) {
      this.currentReport = report;
    },
  }
});
