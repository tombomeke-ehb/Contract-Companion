// frontend/src/store/contractStore.js

import { defineStore } from "pinia";

export const useContractStore = defineStore('contracts', {
  state: () => ({
    contracts: [],
  }),

  actions: {
    setContracts(list) {
      this.contracts = list;
    }
  }
});
