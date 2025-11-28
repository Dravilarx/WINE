
export interface Wine {
  id: string;
  nombre: string;
  bodega: string;
  anada: string;
  pais: string;
  tipoUva: string;
  notasDeCata: string;
  imagenBase64: string; // La imagen original de la etiqueta subida (Respaldo)
  imagenUrl?: string; // URL de la imagen encontrada en internet (Prioritaria)
  stock: number; // Cantidad de botellas
  precioReferencia?: string; // Precio de referencia extraído de la web
  precioAdquisicion?: string; // Precio de compra ingresado por el usuario
}
