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
    getReportById(id) {
      return this.contracts.find(c => String(c.id) === String(id)) || null;
    },
  }
});
