import axiosInstance from './axios';

export interface KycVerificationRequest {
  userId: string;
  documentType: 'PASSPORT' | 'DRIVER_LICENSE' | 'NATIONAL_ID';
  documentNumber: string;
  idImageBase64: string;
}

export interface KycVerificationResponse {
  userId: string;
  status: 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  rejectionReason?: string;
  updatedAt?: string;
}

export const kycApi = {
  startVerification: async (data: KycVerificationRequest): Promise<KycVerificationResponse> => {
    const response = await axiosInstance.post('/api/kyc/verify', data);
    return response.data;
  },

  getStatus: async (userId: string): Promise<KycVerificationResponse> => {
    const response = await axiosInstance.get(`/api/kyc/status/${userId}`);
    return response.data;
  },
};
