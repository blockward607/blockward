
import { supabase } from '@/integrations/supabase/client';

export class SecurityService {
  /**
   * Validates and sanitizes user input to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters and patterns
    return input
      .trim()
      .replace(/[<>'"\\;]/g, '') // Remove dangerous characters
      .substring(0, 1000); // Limit length
  }

  /**
   * Validates UUIDs to ensure they match the expected format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 320;
  }

  /**
   * Validates classroom codes to ensure they only contain allowed characters
   */
  static isValidClassroomCode(code: string): boolean {
    const codeRegex = /^[A-Z0-9]{4,8}$/;
    return codeRegex.test(code);
  }

  /**
   * Validates numeric input
   */
  static isValidNumber(value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): boolean {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  /**
   * Validates text input length and content
   */
  static isValidText(text: string, maxLength: number = 1000): boolean {
    return typeof text === 'string' && text.length <= maxLength;
  }

  /**
   * Logs security events for monitoring
   */
  static async logSecurityEvent(event: string, details: any) {
    console.warn(`Security Event: ${event}`, details);
    // In production, this would send to a monitoring service
  }
}
