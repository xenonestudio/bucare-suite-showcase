export interface CreateCitaDto {
  clienteId: string;
  fecha: string;
  tipoPropiedad: 'APARTAMENTO' | 'LOCAL';
  notas?: string;
}

export interface UpdateCitaDto {
  estado?: 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA';
  fecha?: string;
  tipoPropiedad?: 'APARTAMENTO' | 'LOCAL';
  notas?: string;
}
