import {render, fireEvent, waitFor, screen, act, cleanup} from '@testing-library/react'
import App from '../../src/App';
import Header from '../../src/Header';
import SearchPage from '../../src/SearchPage';
import user_info from '../../user.json';
import {mockdata} from "../utils/products.js";
import {mockdata2} from "../utils/products2.js";
import {mockdata as studentmockproducts} from "../../src/constants/products";
import {MemoryRouter, BrowserRouter} from 'react-router';


const mytestconfig = {
  server_url: "https://dummyjson.com/products",
  num_items: 100,  
  use_server: false,
  loading_timeout_ms: 2000
};

jest.setTimeout(10000);

jest.mock('../../src/config/config', () => ( {
  __esModule: true,
  default: mytestconfig  
} ));

afterAll(() => jest.resetAllMocks());

beforeAll(() => {
  jest.useFakeTimers()
});

//Los tests usan BrowserRouter, que lee y escribe la URL real de jsdom, y esa URL es COMPARTIDA
//entre todos los tests del fichero. Sin esto, los parámetros que deja un test (?q=..., ?category=...)
//siguen puestos en el siguiente y lo hacen fallar. Cada test debe partir de una URL limpia.
beforeEach(() => {
  window.history.pushState({}, "", "/");
});

// Running all pending timers and switching to real timers using Jest
afterAll(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
});


let testinfo = {
    name: "La aplicación tiene un componente Header con el logo y el mensaje de bienvenida con tu nombre",
    score: 0.5,
    msg_ok: "Header encontrada",
    msg_error: "Header no encontrada o no es como se esperaba, revise el enunciado"
}
test(JSON.stringify(testinfo), () => {
  render(<Header />);
  const cabecera = document.querySelector('#cabecera');
  const logo = document.querySelector('.logo');
  const mensaje = document.querySelector('.mensaje');

  expect(cabecera).toBeInTheDocument();
  expect(user_info).toHaveProperty('name');
  expect(user_info).toHaveProperty('email');
  expect(user_info).toHaveProperty('token');
  expect(mensaje).toHaveTextContent(new RegExp(user_info.name, 'i'));
  expect(cabecera.tagName).toBe('DIV');
  expect(cabecera).toContainElement(logo);
  expect(cabecera).toContainElement(mensaje);
});

testinfo = {
  name: "La aplicación, mientras carga, muestra un spinner con una clase y un id adecuados",
  score: 0.5,
  msg_ok: "spinner encontrado",
  msg_error: "spinner NO encontrado mientras la aplicación carga"
}
test(JSON.stringify(testinfo), async () => {
  await act(async () => {
    render(<BrowserRouter><App /></BrowserRouter>);
  });
  const spinner = document.querySelector('#myspinner');
  expect(spinner).toBeInTheDocument();
  const spinnerbyclass = document.querySelector('.loading');
  expect(spinnerbyclass).toBeInTheDocument();
  const catalogo = document.querySelector('#catalogo');
  expect(catalogo).not.toBeInTheDocument();
});


testinfo = {
  name: "La aplicación tiene un componente SearchPage, con al menos un input y un button",
  score: 0.5,
  msg_ok: "Componente SearchPage encontrado y con input y button correctos",
  msg_error: "El componente SearchPage no se ha encontrado o no tiene el input y button correctos"
}
test(JSON.stringify(testinfo), () => {
  render(<BrowserRouter><SearchPage theproducts={mockdata.products} /></BrowserRouter>);
  const theinput = document.querySelector('#filtro');
  expect(theinput).toBeInTheDocument();
  expect(theinput.tagName).toBe('INPUT');
  const buscabtn = document.querySelector('#buscador');
  expect(buscabtn).toBeInTheDocument();
  expect(buscabtn.tagName).toBe('BUTTON');
});


testinfo = {
  name: "La aplicación tiene un componente SearchPage que renderiza los productos que recibe",
  score: 1,
  msg_ok: "Componente SearchPage encontrado productos renderizados",
  msg_error: "El componente SearchPage no se ha encontrado o no renderiza correctamente los productos"
}
test(JSON.stringify(testinfo), () => {
  render(<BrowserRouter><SearchPage theproducts={mockdata.products} /></BrowserRouter>);
  const productos = document.querySelectorAll('#productosresultados .miproducto');
  expect(productos.length).toBe(100);
});


testinfo = {
  name: "La aplicación maneja el valor del input y filtra los resultados por su título al pulsar el button",
  score: 0.5,
  msg_ok: "El input de la aplicación funciona correctamente y filtra al pulsar el botón",
  msg_error: "El input de la aplicación NO funciona correctamente o NO filtra al pulsar el botón"
}
test(JSON.stringify(testinfo), () => {
  render(<BrowserRouter><SearchPage theproducts={mockdata.products} /></BrowserRouter>);
  const theinput = document.querySelector('#filtro');
  expect(theinput).toBeInTheDocument();
  const buscabtn = document.querySelector('#buscador');
  expect(buscabtn).toBeInTheDocument();
  fireEvent.change(theinput, {target: {value: "me"}})
  expect(theinput).toHaveValue("me");
  fireEvent.click(buscabtn);
  const productos = document.querySelectorAll('#productosresultados .miproducto');
  expect(productos.length).toBe(5);
});


testinfo = {
  name: "La aplicación tiene un selector de categorías de productos y está relleno correctamente para mockdata",
  score: 0.25,
  msg_ok: "Selector de categorías de productos encontrado y bien relleno",
  msg_error: "Selector de categorías de productos NO encontrado o NO está bien relleno"
}
test(JSON.stringify(testinfo), () => {
  render(<BrowserRouter><SearchPage theproducts={mockdata.products} /></BrowserRouter>);
  const theselector = document.querySelector('#miselector');
  expect(theselector).toBeInTheDocument();
  const selectoroptions = document.querySelectorAll('#miselector option');
  expect(selectoroptions.length).toBe(12);
  expect([...selectoroptions].map((x)=>x.value)).toEqual(
    expect.arrayContaining([ "All", "beauty", "fragrances", "furniture", "groceries", "home-decoration", "kitchen-accessories", "laptops", "mens-shirts", "mens-shoes"])
  );
});


testinfo = {
  name: "La aplicación tiene un selector de categorías de productos y está relleno correctamente para mockdata2",
  score: 0.25,
  msg_ok: "Selector de categorías de productos encontrado y bien relleno",
  msg_error: "Selector de categorías de productos NO encontrado o NO está bien relleno"
}
test(JSON.stringify(testinfo), () => {    
  render(<BrowserRouter><SearchPage theproducts={mockdata2.products} /></BrowserRouter>);
  const theselector2 = document.querySelector('#miselector');
  expect(theselector2).toBeInTheDocument();
  const selectoroptions2 = document.querySelectorAll('#miselector option');
  expect(selectoroptions2.length).toBe(7);
  expect([...selectoroptions2].map((x)=>x.value)).toEqual(
    expect.arrayContaining(["All", "beauty", "fragrances", "furniture", "groceries", "mobile-accessories", "smartphones"])
  );
});

testinfo = {
  name: "La aplicación tiene un selector de categorías de productos y filtra al seleccionar una categoría",
  score: 0.5,
  msg_ok: "El selector de categorías funciona correctamente",
  msg_error: "El selector de categorías NO funciona correctamente"
}
test(JSON.stringify(testinfo), () => {
  render(<BrowserRouter><SearchPage theproducts={mockdata.products} /></BrowserRouter>);
  const theselector = document.querySelector('#miselector');
  expect(theselector).toBeInTheDocument();
  fireEvent.change(theselector, {target: {value: "fragrances"}})

  const productos = document.querySelectorAll('#productosresultados .miproducto');
  expect(productos.length).toBe(5);
});

testinfo = {
  name: "La aplicación guarda los dos filtros en la ruta con useSearchParams y calcula la lista a partir de ellos",
  score: 1,
  msg_ok: "UseSearchParams funciona correctamente",
  msg_error: "UseSearchParams NO funciona correctamente"
}
test(JSON.stringify(testinfo), () => {
  const cuentaProductos = () => document.querySelectorAll('#productosresultados .miproducto').length;

  render(<BrowserRouter><SearchPage theproducts={mockdata.products} /></BrowserRouter>);
  const theselector = document.querySelector('#miselector');
  expect(theselector).toBeInTheDocument();
  fireEvent.change(theselector, {target: {value: "furniture"}})

  const divlocation = document.querySelector('#divsearch');
  expect(divlocation).toBeInTheDocument();
  expect(divlocation).toHaveTextContent("Category furniture");
  expect(window.location.search).toContain("category=furniture");
  //en mockdata hay 5 productos de furniture
  expect(cuentaProductos()).toBe(5);

  //el texto buscado también va a la ruta, y se combina con la categoría sin perderla.
  //"table" aparece en 2 títulos de todo el catálogo, pero solo en 1 dentro de furniture:
  //si saliera 5 se estaría ignorando el texto, y si saliera 2 se estaría perdiendo la categoría
  fireEvent.change(document.querySelector('#filtro'), {target: {value: "table"}});
  fireEvent.click(document.querySelector('#buscador'));
  expect(window.location.search).toContain("category=furniture");
  expect(window.location.search).toContain("q=table");
  expect(cuentaProductos()).toBe(1);
  //y el selector sigue mostrando la categoría: la pantalla no se contradice
  expect(theselector).toHaveValue("furniture");

  //volver a "All" quita el parámetro de la ruta pero conserva la búsqueda
  fireEvent.change(theselector, {target: {value: "All"}});
  expect(window.location.search).not.toContain("category");
  expect(window.location.search).toContain("q=table");
  expect(cuentaProductos()).toBe(2);

  //sin filtros la ruta queda limpia, sin ?category=All&q=
  fireEvent.change(document.querySelector('#filtro'), {target: {value: ""}});
  fireEvent.click(document.querySelector('#buscador'));
  expect(window.location.search).toBe("");
  expect(cuentaProductos()).toBe(100);

  //y al revés: al entrar directamente por una ruta con los dos filtros (un enlace compartido)
  //el selector aparece relleno y la lista sale ya filtrada por ambos
  cleanup();
  window.history.pushState({}, "", "/?category=furniture&q=table");
  render(<BrowserRouter><SearchPage theproducts={mockdata.products} /></BrowserRouter>);
  expect(document.querySelector('#miselector')).toHaveValue("furniture");
  expect(cuentaProductos()).toBe(1);
});


testinfo = {
  name: "La aplicación tiene un componente para la página de un producto",
  score: 1,
  msg_ok: "La página del producto funciona correctamente",
  msg_error: "La página del producto NO funciona correctamente"
}
test(JSON.stringify(testinfo), async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve(mockdata)
  }));

  await act(async () => {
    render(<MemoryRouter initialEntries={["/products/17"]}>
      <App />
    </MemoryRouter>);
  });
  //run the setTimeout so the loading spinner is removed from the UX
  act(()=>jest.runAllTimers());

  await waitFor(async () => {
    const titulo = document.querySelector('#titulo');
    expect(titulo).toBeInTheDocument();
    //check product with id 17 is rendered
    //we use studentmockproducts because in this case we are using App that uses constants/products.js as mock data
    expect(titulo).toHaveTextContent(studentmockproducts.products.find((x)=>x.id===17).title);
  
    const divlocation = document.querySelector('#divlocation');
    expect(divlocation).toBeInTheDocument();
    expect(divlocation).toHaveTextContent("/products/17");

    const divproductid = document.querySelector('#divproductid');
    expect(divproductid).toBeInTheDocument();
    expect(divproductid).toHaveTextContent("17");

    const volver = document.querySelector('#volver');
    expect(volver).toBeInTheDocument();    
  });
});



testinfo = {
  name: "La aplicación tiene una ruta para NoMatch",
  score: 1,
  msg_ok: "La ruta NoMatch funciona correctamente",
  msg_error: "La ruta NoMatch NO funciona correctamente"
}
test(JSON.stringify(testinfo), async () => {

  await act(async () => {
    render(<MemoryRouter initialEntries={["/rutanoexiste"]}>
      <App />
    </MemoryRouter>);
  });
  //run the setTimeout so the loading spinner is removed from the UX
  act(()=>jest.runAllTimers());

  await waitFor(async () => {
    const info = document.querySelector('#info');
    expect(info).toBeInTheDocument();
    expect(info).toHaveTextContent("Ruta no encontrada");

    const volver = document.querySelector('#volver');
    expect(volver).toBeInTheDocument();    
  });
});