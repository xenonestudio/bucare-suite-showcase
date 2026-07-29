/**
 * Clase base para excepciones operacionales controladas en el servidor.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;

  /**
   * Crea una nueva instancia de AppError.
   *
   * @param message - Descripción detallada del error.
   * @param statusCode - Código de estado HTTP (ej. 400, 404, 409, 500).
   * @param errorCode - Código interno de identificación de error.
   * @param isOperational - Indica si es un error operacional conocido.
   */
  constructor(
    message: string,
    statusCode = 500,
    errorCode?: string,
    isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
