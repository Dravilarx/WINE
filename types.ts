export interface Wine {
  id: string;
  nombre: string;
  bodega: string;
  anada: string;
  pais: string;
  tipoUva: string;
  notasDeCata: string;
  imagenBase64: string; // La imagen original de la etiqueta subida
  stock: number; // Cantidad de botellas
  precioReferencia?: string; // Precio de referencia extraído de la web
  precioAdquisicion?: string; // Precio de compra ingresado por el usuario
}