import crypto from 'crypto';

/**
 * Excepción específica para fallos en la encriptación/desencriptación.
 */
export class EncryptionFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionFailedException';
  }
}

/**
 * Interface del payload encriptado que retorna el servicio.
 */
export interface IEncryptedPayload {
  encryptedData: string;
  initializationVector: string;
  authTag: string;
}

/**
 * Encripta un texto plano utilizando el algoritmo nativo AES-256-GCM.
 *
 * @param plainText - Cadena de texto o JSON serializado a cifrar.
 * @param secretKeyHex - Clave secreta de encriptación en formato Hexadecimal (64 caracteres = 32 bytes).
 * @returns {IEncryptedPayload} Objeto con la información cifrada, IV y Tag de autenticación en formato Hex.
 * @throws {EncryptionFailedException} Ocurre si la clave no tiene la longitud adecuada o si el proceso falla.
 */
export function encryptPayloadAES256GCM(plainText: string, secretKeyHex: string): IEncryptedPayload {
  try {
    const keyBuffer = Buffer.from(secretKeyHex, 'hex');
    
    if (keyBuffer.length !== 32) {
      throw new EncryptionFailedException('La clave secreta debe ser exactamente de 32 bytes (64 caracteres Hex) para AES-256.');
    }

    // 1. Generar vector de inicialización (IV) criptográficamente seguro (12 bytes es el estándar para GCM)
    const initializationVector = crypto.randomBytes(12);

    // 2. Inicializar cifrador en modo GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, initializationVector);

    // 3. Cifrar la información
    let encryptedData = cipher.update(plainText, 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    // 4. Obtener tag de autenticación para garantizar la integridad
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encryptedData,
      initializationVector: initializationVector.toString('hex'),
      authTag
    };
  } catch (error: any) {
    if (error instanceof EncryptionFailedException) throw error;
    throw new EncryptionFailedException(`Fallo durante la encriptación: ${error.message}`);
  }
}

/**
 * Desencripta un payload cifrado con AES-256-GCM.
 *
 * @param encryptedPayload - Objeto con la data, el IV y el AuthTag (todo en Hex).
 * @param secretKeyHex - Clave secreta de encriptación en formato Hexadecimal (32 bytes).
 * @returns {string} El texto plano original.
 * @throws {EncryptionFailedException} Si la desencriptación falla, el tag es inválido o la clave es incorrecta.
 */
export function decryptPayloadAES256GCM(
  encryptedPayload: IEncryptedPayload,
  secretKeyHex: string
): string {
  try {
    const keyBuffer = Buffer.from(secretKeyHex, 'hex');
    
    if (keyBuffer.length !== 32) {
      throw new EncryptionFailedException('La clave secreta debe ser exactamente de 32 bytes (64 caracteres Hex) para AES-256.');
    }

    const ivBuffer = Buffer.from(encryptedPayload.initializationVector, 'hex');
    const authTagBuffer = Buffer.from(encryptedPayload.authTag, 'hex');

    // Inicializar el descifrador
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    
    // Asignar el auth tag antes de desencriptar para verificar integridad
    decipher.setAuthTag(authTagBuffer);

    // Desencriptar
    let plainText = decipher.update(encryptedPayload.encryptedData, 'hex', 'utf8');
    plainText += decipher.final('utf8');

    return plainText;
  } catch (error: any) {
    throw new EncryptionFailedException(`Fallo en la desencriptación o integridad comprometida: ${error.message}`);
  }
}
