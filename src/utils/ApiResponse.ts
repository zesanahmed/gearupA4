export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | undefined;

  constructor(message: string, data?: T | undefined) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}
