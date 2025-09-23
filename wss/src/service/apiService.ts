import { CONFIG } from '../config';

export class ApiService {
  static async verifyClassroomAccess(
    userId: string,
    userType: 'instructor' | 'student',
    classroomId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/classroom/${classroomId}/verify-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userType })
      });

      if (!response.ok) {
        console.error(`API request failed: ${response.status} ${response.statusText}`);
        return false;
      }

      const result = await response.json();
      return result.hasAccess;
    } catch (error) {
      console.error('Error verifying classroom access:', error);
      return false;
    }
  }

  static async saveMessage(messageData: {
    content: string;
    classroomId: string;
    senderId: string;
    senderType: 'instructor' | 'student';
  }) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving message to database:', error);
      throw error;
    }
  }

  static async getClassroomInfo(classroomId: string) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/classrooms/${classroomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching classroom info:', error);
      throw error;
    }
  }
}