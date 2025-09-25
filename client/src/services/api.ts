import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export interface ChatCompletionRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  system_message?: string;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  message: {
    role: string;
    content: string;
  };
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface Model {
  id: string;
  name: string;
  created: number;
  owned_by: string;
}

export interface FineTuneJob {
  id: string;
  object: string;
  model: string;
  created_at: number;
  finished_at?: number;
  fine_tuned_model?: string;
  organization_id: string;
  result_files: string[];
  status: string;
  validation_file?: string;
  training_file: string;
  hyperparameters: {
    n_epochs: number;
  };
  trained_tokens?: number;
  error?: {
    code: string;
    message: string;
    param?: string;
  };
}

class ApiService {
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await api.get('/health');
    return response.data;
  }

  async getModels(): Promise<Model[]> {
    const response = await api.get('/models');
    return response.data;
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await api.post('/chat', {
      ...request,
      stream: false,
    });
    return response.data;
  }

  async streamChatCompletion(
    request: ChatCompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            onChunk(line);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async uploadFineTuneFile(file: File): Promise<{ file_id: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/fine-tune/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async createFineTuneJob(
    trainingFile: string,
    validationFile?: string,
    model: string = 'gpt-3.5-turbo',
    suffix?: string
  ): Promise<FineTuneJob> {
    const response = await api.post('/fine-tune/create', {
      training_file: trainingFile,
      validation_file: validationFile,
      model,
      suffix,
    });

    return response.data;
  }

  async getFineTuneJobs(): Promise<FineTuneJob[]> {
    const response = await api.get('/fine-tune/list');
    return response.data;
  }

  async getFineTuneJob(jobId: string): Promise<FineTuneJob> {
    const response = await api.get(`/fine-tune/${jobId}`);
    return response.data;
  }
}

export const apiService = new ApiService();
