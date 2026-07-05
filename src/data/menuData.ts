export interface Dish {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: string;
}

export interface Category {
  id: string;
  nombre: string;
  items: Dish[];
}

export const DEFAULT_MENU_DATA: Category[] = [
  {
    id: "a-la-brasa",
    nombre: "A la Brasa",
    items: [
      {
        nombre: "1/4 de Pollo a la Brasa",
        descripcion: "Porción de pollo a la brasa. Opciones visibles: 1) con papas fritas y ensalada clásica; 2) con papas fritas y arroz chaufa.",
        precio: "S/. 19.90",
        imagen: ""
      },
      {
        nombre: "1/2 de Pollo a la Brasa",
        descripcion: "Media porción de pollo a la brasa. Opciones visibles: 1) con papas fritas y ensalada clásica; 2) con papas fritas y arroz chaufa.",
        precio: "S/. 36.90",
        imagen: ""
      },
      {
        nombre: "1 Pollo a la Brasa",
        descripcion: "Pollo entero a la brasa. Opciones visibles: 1) con papas fritas y ensalada clásica; 2) con papas fritas y arroz chaufa.",
        precio: "S/. 66.90",
        imagen: ""
      }
    ]
  },
  {
    id: "a-la-carta",
    nombre: "A la Carta",
    items: [
      {
        nombre: "Lomo Saltado con papas fritas y arroz blanco",
        descripcion: "Lomo saltado acompañado con papas fritas y arroz blanco.",
        precio: "S/. 24.00",
        imagen: ""
      },
      {
        nombre: "Lomo Saltado con papas fritas y arroz chaufa",
        descripcion: "Lomo saltado acompañado con papas fritas y arroz chaufa.",
        precio: "S/. 25.00",
        imagen: ""
      },
      {
        nombre: "Lomo Saltado a lo pobre",
        descripcion: "Lomo saltado a lo pobre con arroz blanco, plátano y huevo frito.",
        precio: "S/. 27.00",
        imagen: ""
      },
      {
        nombre: "Pollo Saltado con papas fritas y arroz blanco",
        descripcion: "Pollo saltado acompañado con papas fritas y arroz blanco.",
        precio: "S/. 22.00",
        imagen: ""
      },
      {
        nombre: "Pollo Saltado con papas fritas y arroz chaufa",
        descripcion: "Pollo saltado acompañado con papas fritas y arroz chaufa.",
        precio: "S/. 23.00",
        imagen: ""
      },
      {
        nombre: "Pollo Saltado a lo pobre",
        descripcion: "Pollo saltado a lo pobre con arroz blanco, plátano y huevo frito.",
        precio: "S/. 24.00",
        imagen: ""
      },
      {
        nombre: "Pollo Broaster con papas fritas y ensalada clásica",
        descripcion: "Pollo broaster, pierna o pecho, acompañado con papas fritas y ensalada clásica.",
        precio: "S/. 22.90",
        imagen: ""
      },
      {
        nombre: "Pollo Broaster con papas fritas y arroz blanco",
        descripcion: "Pollo broaster, pierna o pecho, acompañado con papas fritas y arroz blanco.",
        precio: "S/. 23.90",
        imagen: ""
      },
      {
        nombre: "Pollo Broaster con papas fritas y arroz chaufa",
        descripcion: "Pollo broaster, pierna o pecho, acompañado con papas fritas y arroz chaufa.",
        precio: "S/. 22.90",
        imagen: ""
      },
      {
        nombre: "Pollo Broaster a lo pobre",
        descripcion: "Pollo broaster, pierna o pecho, a lo pobre con arroz blanco, plátano y huevo frito.",
        precio: "S/. 25.90",
        imagen: ""
      },
      {
        nombre: "Tallarín Saltado de Carne",
        descripcion: "Tallarín saltado de carne estilo criollo-oriental.",
        precio: "S/. 23.00",
        imagen: ""
      },
      {
        nombre: "Tallarín Saltado de Pollo",
        descripcion: "Tallarín saltado de pollo estilo criollo-oriental.",
        precio: "S/. 21.00",
        imagen: ""
      },
      {
        nombre: "Chicharrón de Pollo",
        descripcion: "Chicharrón de pollo, plato crocante de estilo popular.",
        precio: "S/. 20.00",
        imagen: ""
      }
    ]
  }
];
