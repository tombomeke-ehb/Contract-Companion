import http from './httpClient'
const API_BASE_URL = import.meta.env.VITE_API_URL;
const BASE_PATH = '/api/common-contracts';

export async function getCommonContractReport(contractKey) {
  const url = `${BASE_PATH}/${contractKey}/report`;
  const res = await http.get(url)
  return res;
}
