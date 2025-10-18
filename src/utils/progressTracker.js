// src/utils/progressTracker.js

// Esta é a "chave" que usaremos para salvar os dados no armazenamento do navegador.
const PROGRESS_KEY = 'bibliafy_reading_progress';

/**
 * Busca o progresso de leitura salvo no localStorage.
 * Retorna um objeto, onde cada chave é o ID de um livro e o valor é uma lista
 * dos capítulos lidos. Ex: { "1": [1, 2, 5], "2": [1] }
 * @returns {Object} O objeto de progresso.
 */
export const getReadingProgress = () => {
  try {
    const progress = localStorage.getItem(PROGRESS_KEY);
    return progress ? JSON.parse(progress) : {};
  } catch (error) {
    console.error("Erro ao ler o progresso de leitura:", error);
    return {};
  }
};

/**
 * Marca um capítulo específico de um livro como lido.
 * @param {string} bookId O ID do livro.
 * @param {number} chapter O número do capítulo lido.
 */
export const markChapterAsRead = (bookId, chapter) => {
  if (!bookId || !chapter) return;

  const progress = getReadingProgress();

  // Se for a primeira vez que lemos um capítulo deste livro, cria a lista.
  if (!progress[bookId]) {
    progress[bookId] = [];
  }

  // Adiciona o capítulo à lista apenas se ele ainda não estiver lá.
  if (!progress[bookId].includes(chapter)) {
    progress[bookId].push(chapter);
  }

  try {
    // Salva o objeto de progresso atualizado de volta no localStorage.
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Erro ao salvar o progresso de leitura:", error);
  }
};
