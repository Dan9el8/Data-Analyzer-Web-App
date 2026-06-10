// src/api.js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

export const uploadFile = (formData) => api.post('/upload', formData);
export const getTaskStatus = (taskId) => api.get(`/task/${taskId}`);
export const getFilteredAnalysis = (taskId, filterStr) => 
    api.post(`/filter/${taskId}?filter_str=${encodeURIComponent(filterStr)}`);
export const getScatterData = (taskId, xCol, yCol, filterStr = '') => 
    api.get(`/scatter/${taskId}?x_col=${xCol}&y_col=${yCol}&filter_str=${encodeURIComponent(filterStr)}`);
export const getBoxplotData = (taskId, numCol, catCol, filterStr = '') => 
    api.get(`/boxplot/${taskId}?numeric_col=${numCol}&category_col=${catCol}&filter_str=${encodeURIComponent(filterStr)}`);
export const getReportUrl = (taskId, format) => 
    `http://localhost:8000/report/${taskId}?format=${format}`;
export const getMapData = (taskId, geoCol, valueCol = null) => 
    api.get(`/map-data/${taskId}?geo_col=${geoCol}&value_col=${valueCol || ''}`);