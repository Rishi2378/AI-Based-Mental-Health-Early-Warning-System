import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeText = async (text) => {
  const response = await API.post('/text/analyze', { text });
  return response.data;
};

export const analyzeVoice = async (audioBlob) => {
  const formData = new FormData();
  const fileExt = audioBlob.type.includes('webm') ? 'webm' : 'wav';
  formData.append('audio', audioBlob, `recording.${fileExt}`);

  const response = await API.post('/voice/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchQuestionnaire = async () => {
  const response = await API.get('/questionnaire/questions');
  return response.data;
};

export const analyzeQuestionnaire = async (answers) => {
  const response = await API.post('/questionnaire/analyze', { answers });
  return response.data;
};

export const createAssessment = async (payload) => {
  const response = await API.post('/assessment/analyze', payload);
  return response.data;
};

export const getAssessmentById = async (id) => {
  const response = await API.get(`/assessment/${id}`);
  return response.data;
};

export const deleteAssessment = async (id) => {
  const response = await API.delete(`/assessment/${id}`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await API.delete('/history/clear');
  return response.data;
};

export const fetchDashboardData = async () => {
  const response = await API.get('/dashboard');
  return response.data;
};

export const fetchHistory = async (page = 1, perPage = 20) => {
  const response = await API.get(`/history?page=${page}&per_page=${perPage}`);
  return response.data;
};

export const fetchModelEvaluation = async () => {
  const response = await API.get('/model-evaluation');
  return response.data;
};

export const retrainModels = async () => {
  const response = await API.post('/retrain-models');
  return response.data;
};

export default API;
