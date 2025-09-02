import {render, fireEvent, waitFor, waitForElementToBeRemoved, screen, act} from '@testing-library/react'
import App from '../../src/App';
import ProductPage from '../../src/ProductPage';
import {mockdata} from "../utils/products.js";
import {mockdata2} from "../utils/products2.js";
import { groq_response } from '../utils/groqresp.js';
import {MemoryRouter, Routes, Route} from 'react-router';

const mytestconfig = {
  server_url: "https://dummyjson.com/products",
  num_items: 50,  
  use_server: true,
  loading_timeout_ms: 2000
};

jest.setTimeout(10000);

jest.mock('../../src/config/config', () => ( {
  __esModule: true,
  default: mytestconfig  
} ));

afterAll(() => jest.resetAllMocks());

beforeEach(() => {
  jest.useFakeTimers()
});

// Running all pending timers and switching to real timers using Jest
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
});


let testinfo = {
  name: "La aplicación hace fetch de datos del servidor remoto",
  score: 1,
  msg_ok: "La aplicación hace fetch correctamente",
  msg_error: "La aplicación NO hace fetch correctamente"
}
test(JSON.stringify(testinfo), async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve(mockdata2)
  }));

  render(<MemoryRouter initialEntries={["/"]}>
    <App />
  </MemoryRouter>);
  //run the setTimeout so the loading spinner is removed from the UX  

  await waitForElementToBeRemoved(await document.querySelector('#myspinner'), { timeout: 8000 })

  //console.log("IMPRIMIMOS EL BODY-------------------");
  //console.log(document.body.innerHTML);

  const productos = document.querySelectorAll('#productosresultados .miproducto');
  expect(productos.length).toBe(39);
  const theinput = document.querySelector('#filtro');
  expect(theinput).toBeInTheDocument();
  const buscabtn = document.querySelector('#buscador');
  expect(buscabtn).toBeInTheDocument();

});


testinfo = {
  name: "La aplicación llama a la IA para generar un resumen de los comentarios",
  score: 1,
  msg_ok: "El resumen de los comentarios con IA funciona correctamente",
  msg_error: "El resumen de los comentarios con IA NO funcionan correctamente"
}
test(JSON.stringify(testinfo), async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve(groq_response)
  }));
  // Render con ruta que define el parámetro :productId para que useParams lo reciba
  render(
    <MemoryRouter initialEntries={["/26"]}>
      <Routes>
        <Route path="/:productId" element={<ProductPage theproducts={mockdata.products} />} />
      </Routes>
    </MemoryRouter>
  );
  
  //run the setTimeout so the loading spinner is removed from the UX
  act(()=>jest.runAllTimers());

  // Si hubiera spinner en esta vista, se podría esperar a su desaparición;
  // en ProductPage no es necesario.

    /*○	En la zona de los comentarios la aplicación tiene un button con id “summarybtn” que al hacerle click hace un POST a https://api.groq.com/openai/v1/chat/completions con un prompt como el siguiente que contiene el contenido de los últimos 3 comentarios: “PROMPT: Crea un resumen de ...”
      ○	Se recibe la respuesta y se muestra el resultado provisto por la IA (data.choices[0].message.content) si existe, esto sale en un div con clase “summary”.
    */

    const summaryBtn = document.querySelector('#summarybtn');
    expect(summaryBtn).toBeInTheDocument();

    // Simulate click on summary button
    fireEvent.click(summaryBtn);

    await waitFor(() => {
      const summary = document.querySelector('.summary');
      expect(summary).toBeInTheDocument();
      expect(summary.textContent).toMatch(/Resumen de Comentarios mock de Green Chili Pepper/);
      expect(summary.textContent).toMatch(/Opiniones negativas/);
      expect(summary.textContent).toMatch(/excelente producto/);
      expect(summary.textContent).toMatch(/mockmockmuy decepcionado/);
    });

});