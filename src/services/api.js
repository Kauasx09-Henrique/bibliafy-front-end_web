// 1. Importa a biblioteca Axios para o seu arquivo.
import axios from 'axios';

// 2. Cria uma nova instância do Axios com configurações personalizadas.
const api = axios.create({
  // 3. Define a URL base para todas as chamadas feitas com esta instância.
  baseURL: 'https://bibliafy-api.onrender.com',
});

// 4. Exporta a instância 'api' para que outros arquivos no seu projeto possam usá-la.
export default api;